"use client";

import { useState, useCallback, useEffect } from "react";
import { useQueryState, parseAsArrayOf, parseAsString, parseAsBoolean } from "nuqs";
import { ChevronDown, Search, X, Check, ChevronsUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  fetchCountries,
  fetchRegions,
  fetchCities,
} from "@/app/actions/locations";
import { fetchCompanies } from "@/app/actions/companies";

const TECH_TAGS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "PostgreSQL",
  "GraphQL",
  "AWS",
  "Docker",
  "Kubernetes",
];

const SOURCES = [
  { label: "Greenhouse" },
  { label: "Lever"},
  { label: "Workday"},
];

export function FilterSidebar() {
  return (
    <aside className="space-y-1">
      <LocationFilter />
      <Separator className="my-3 bg-border/50" />
      <CompanyFilter />
      <Separator className="my-3 bg-border/50" />
      <TechStackFilter />
      <Separator className="my-3 bg-border/50" />
      <SourceFilter />
      <Separator className="my-3 bg-border/50" />
      <ActiveToggle />
    </aside>
  );
}

/* ────────────────── Location Filter ────────────────── */
type OptionItem = { id: number | string; name: string; iso2?: string; code?: string };

// Client-side module-level cache — persists across re-renders without hitting the server
let _countriesCache: OptionItem[] = [];
let _countriesFetched = false;
const _regionsCache = new Map<string, OptionItem[]>();
const _citiesCache = new Map<string, OptionItem[]>();

function LocationFilter() {
  const [country, setCountry] = useQueryState("country", parseAsString.withDefault(""));
  const [region, setRegion] = useQueryState("region", parseAsString.withDefault(""));
  const [city, setCity] = useQueryState("city", parseAsString.withDefault(""));
  const [isOpen, setIsOpen] = useState(true);

  const [countriesList, setCountriesList] = useState<OptionItem[]>(_countriesCache);
  const [regionsList, setRegionsList] = useState<OptionItem[]>(() => 
    country ? (_regionsCache.get(country) || []) : []
  );
  const [citiesList, setCitiesList] = useState<OptionItem[]>(() => {
    if (!region || !country) return [];
    return _citiesCache.get(`${country}:${region}`) || [];
  });
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch countries on mount (only if not cached)
  useEffect(() => {
    if (_countriesFetched) {
      setCountriesList(_countriesCache);
      return;
    }
    setLoadingCountries(true);
    fetchCountries().then((data) => {
      _countriesCache = data as OptionItem[];
      _countriesFetched = true;
      setCountriesList(data);
      setLoadingCountries(false);
    });
  }, []);

  // Fetch regions when country changes (only if not cached)
  useEffect(() => {
    if (!country) {
      setRegionsList([]);
      return;
    }
    if (_regionsCache.has(country)) {
      setRegionsList(_regionsCache.get(country)!);
      return;
    }
    setLoadingRegions(true);
    fetchRegions(country).then((data) => {
      _regionsCache.set(country, data);
      setRegionsList(data);
      setLoadingRegions(false);
    });
  }, [country]);

  // Fetch cities when region changes (only if not cached)
  useEffect(() => {
    if (!region) {
      setCitiesList([]);
      return;
    }
    const cacheKey = `${country}:${region}`;
    if (_citiesCache.has(cacheKey)) {
      setCitiesList(_citiesCache.get(cacheKey)!);
      return;
    }
    const selectedRegion = regionsList.find((r) => r.name === region);
    if (selectedRegion) {
      setLoadingCities(true);
      fetchCities(Number(selectedRegion.id)).then((data) => {
        _citiesCache.set(cacheKey, data);
        setCitiesList(data);
        setLoadingCities(false);
      });
    }
  }, [region, regionsList, country]);

  const handleCountryChange = (value: string) => {
    if (value === "__clear__") {
      setCountry(null);
      setRegion(null);
      setCity(null);
    } else {
      setCountry(value);
      setRegion(null);
      setCity(null);
    }
  };

  const handleRegionChange = (value: string) => {
    if (value === "__clear__") {
      setRegion(null);
      setCity(null);
    } else {
      setRegion(value);
      setCity(null);
    }
  };

  const handleCityChange = (value: string) => {
    setCity(value === "__clear__" ? null : value);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-white transition-colors">
        <span className="flex items-center gap-2">
          <span className="text-base">📍</span> Location
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-3">
        {/* Country */}
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            Country
          </label>
          <Select value={country || "__none__"} onValueChange={handleCountryChange}>
            <SelectTrigger className="h-8 w-full border-border/50 bg-secondary/30 text-xs">
              <SelectValue placeholder={loadingCountries ? "Loading..." : "All countries"} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-[240px]">
              <SelectItem value="__clear__" className="text-muted-foreground">
                All countries
              </SelectItem>
              {countriesList.map((c) => (
                <SelectItem key={c.iso2 || c.id} value={c.iso2 || String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Region — shown only when a country is selected */}
        {country && (
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              Region / State
            </label>
            <Select value={region || "__none__"} onValueChange={handleRegionChange}>
              <SelectTrigger className="h-8 w-full border-border/50 bg-secondary/30 text-xs">
                <SelectValue placeholder={loadingRegions ? "Loading..." : "All regions"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[240px]">
                <SelectItem value="__clear__" className="text-muted-foreground">
                  All regions
                </SelectItem>
                {regionsList.map((r) => (
                  <SelectItem key={r.code || r.id} value={r.name}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* City — shown only when a region is selected */}
        {region && (
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              City
            </label>
            <Select value={city || "__none__"} onValueChange={handleCityChange}>
              <SelectTrigger className="h-8 w-full border-border/50 bg-secondary/30 text-xs">
                <SelectValue placeholder={loadingCities ? "Loading..." : "All cities"} />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border max-h-[240px]">
                <SelectItem value="__clear__" className="text-muted-foreground">
                  All cities
                </SelectItem>
                {citiesList.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ────────────────── Company Filter ────────────────── */
let _companiesCache: { id: number | string; name: string }[] = [];
let _companiesFetched = false;

function CompanyFilter() {
  const [companyId, setCompanyId] = useQueryState("company_id", parseAsString.withDefault(""));
  const [isOpen, setIsOpen] = useState(true);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [companies, setCompanies] = useState<{ id: number | string; name: string }[]>(_companiesCache);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (_companiesFetched) {
      setCompanies(_companiesCache);
      return;
    }
    setLoading(true);
    fetchCompanies().then((data) => {
      _companiesCache = data;
      _companiesFetched = true;
      setCompanies(data);
      setLoading(false);
    });
  }, []);

  const selectedCompany = companies.find((c) => String(c.id) === companyId);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-white transition-colors">
        <span className="flex items-center gap-2">
          <span className="text-base">🏢</span> Company
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-3">
        <div>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between h-8 border-border/50 bg-secondary/30 text-xs text-muted-foreground hover:bg-secondary/50 font-normal"
              >
                {loading
                  ? "Loading..."
                  : selectedCompany
                  ? selectedCompany.name
                  : "All companies"}
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[100%] p-0 bg-popover border-border">
              <Command>
                <CommandInput placeholder="Search company..." className="h-9 text-xs" />
                <CommandList className="max-h-[220px]">
                  <CommandEmpty className="py-6 text-center text-xs">No company found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__clear__"
                      onSelect={() => {
                        setCompanyId(null);
                        setOpenCombobox(false);
                      }}
                      className="text-xs text-muted-foreground"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          companyId === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All companies
                    </CommandItem>
                    {companies.map((company) => (
                      <CommandItem
                        key={company.id}
                        value={company.name}
                        onSelect={() => {
                          setCompanyId(String(company.id));
                          setOpenCombobox(false);
                        }}
                        className="text-xs"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            companyId === String(company.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {company.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ────────────────── Tech Stack Filter ────────────────── */
const MAX_TAGS = 5;

const SUGGESTED_TAGS = ["React", "Python", "AWS", "Go", "TypeScript"];

function TechStackFilter() {
  const [tags, setTags] = useQueryState(
    "tags",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");

  const atLimit = tags.length >= MAX_TAGS;

  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setTags((prev) => {
        if (prev.length >= MAX_TAGS || prev.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return prev;
        return [...prev, trimmed];
      });
    },
    [setTags]
  );

  const removeTag = useCallback(
    (value: string) => {
      setTags((prev) => prev.filter((t) => t !== value));
    },
    [setTags]
  );

  const toggle = useCallback(
    (value: string) => {
      setTags((prev) =>
        prev.some((t) => t.toLowerCase() === value.toLowerCase())
          ? prev.filter((t) => t.toLowerCase() !== value.toLowerCase())
          : prev.length >= MAX_TAGS
          ? prev
          : [...prev, value]
      );
    },
    [setTags]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(search);
      setSearch("");
    }
  };

  const filtered = TECH_TAGS.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  // Suggested tags that aren't already selected
  const suggestions = SUGGESTED_TAGS.filter(
    (s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-white transition-colors">
        <span className="flex items-center gap-2">
          <span className="text-base">⚡</span> Tech Stack
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {/* Selected tag pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-500/30 transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <span className="self-center text-[10px] text-muted-foreground/50">
              {tags.length}/{MAX_TAGS}
            </span>
          </div>
        )}

        {/* Search / custom tag input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={atLimit}
            placeholder={atLimit ? "Max tags reached" : "Search or add custom tag…"}
            className="h-8 w-full rounded-md border border-border/50 bg-secondary/30 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Suggested tags */}
        {suggestions.length > 0 && !atLimit && !search && (
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Suggested
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => addTag(tag)}
                  className="rounded-full border border-border/50 bg-secondary/40 px-2.5 py-0.5 text-[11px] text-muted-foreground transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}


      </CollapsibleContent>
    </Collapsible>
  );
}

/* ────────────────── Source Filter ────────────────── */
function SourceFilter() {
  const [sources, setSources] = useQueryState(
    "source",
    parseAsArrayOf(parseAsString).withDefault([])
  );
  const [isOpen, setIsOpen] = useState(true);

  const toggle = useCallback(
    (value: string) => {
      setSources((prev) =>
        prev.includes(value)
          ? prev.filter((s) => s !== value)
          : [...prev, value]
      );
    },
    [setSources]
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-white transition-colors">
        <span className="flex items-center gap-2">
          <span className="text-base">📡</span> Source
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-1.5">
        {SOURCES.map((src) => (
          <label
            key={src.label}
            className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-3">
              <Checkbox
                checked={sources.includes(src.label)}
                onCheckedChange={() => toggle(src.label)}
                className="border-muted-foreground/50 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
              />
              {src.label}
            </span>
          </label>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ────────────────── Active Toggle ────────────────── */
function ActiveToggle() {
  const [showClosed, setShowClosed] = useQueryState(
    "show_closed",
    parseAsBoolean.withDefault(false)
  );

  return (
    <button
      onClick={() => setShowClosed(showClosed ? null : true)}
      className={`text-xs transition-colors ${
        showClosed
          ? "text-emerald-400"
          : "text-muted-foreground/60 hover:text-muted-foreground"
      }`}
    >
      {showClosed ? "✓ Showing closed jobs" : "Show closed jobs"}
    </button>
  );
}
