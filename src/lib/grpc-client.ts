import 'server-only';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Load all proto paths
const PROTO_DIR = path.join(process.cwd(), 'proto');
const GRPC_HOST = process.env.GRPC_HOST || 'localhost:8080';
const GRPC_API_KEY = process.env.GRPC_API_KEY || '';

const loadProto = (filename: string) => {
  const packageDefinition = protoLoader.loadSync(path.join(PROTO_DIR, filename), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(packageDefinition);
};

// Load specific protos
const citiesProto = loadProto('cities.proto') as any;
const companyProto = loadProto('company.proto') as any;
const countriesProto = loadProto('countries.proto') as any;
const jobsProto = loadProto('jobs.proto') as any;
const regionsProto = loadProto('regions.proto') as any;

let cleanHost = GRPC_HOST.replace(/^https?:\/\//, '');
const isSecure = cleanHost.includes('.run.app') || GRPC_HOST.startsWith('https://');

if (isSecure && !cleanHost.includes(':')) {
  cleanHost += ':443';
}

const credentials = isSecure 
  ? grpc.credentials.createSsl() 
  : grpc.credentials.createInsecure();

const grpcOptions = {
  'grpc.keepalive_time_ms': 30000,
  'grpc.keepalive_timeout_ms': 10000,
  'grpc.keepalive_permit_without_calls': 1,
};

// Create clients for exported services
export const cityClient = new citiesProto.CityService(cleanHost, credentials, grpcOptions);
export const companyClient = new companyProto.CompanyService(cleanHost, credentials, grpcOptions);
export const countryClient = new countriesProto.CountryService(cleanHost, credentials, grpcOptions);
export const jobClient = new jobsProto.JobService(cleanHost, credentials, grpcOptions);
export const regionClient = new regionsProto.RegionService(cleanHost, credentials, grpcOptions);

// Helper for sending API Key Metadata
const getAuthMetadata = () => {
  const metadata = new grpc.Metadata();
  metadata.add('x-api-key', GRPC_API_KEY);
  return metadata;
};

// Generic helper to promisify gRPC calls
const promisifyGrpcCall = (client: any, method: string, request: any = {}) => {
  return new Promise<any>((resolve, reject) => {
    client[method](request, getAuthMetadata(), (err: any, response: any) => {
      if (err) reject(err);
      else resolve(response);
    });
  });
};

// Job Service
export const getJobsGrpc = (request: any = {}) => promisifyGrpcCall(jobClient, 'GetJobs', request);
export const getJobByIdGrpc = (id: number) => promisifyGrpcCall(jobClient, 'GetJobById', { id });

// Location Services
export const getCitiesGrpc = (id: number) => promisifyGrpcCall(cityClient, 'GetCities', { id });
export const getCountriesGrpc = () => promisifyGrpcCall(countryClient, 'GetCountries');
export const getRegionsGrpc = (iso2Code: string) => promisifyGrpcCall(regionClient, 'GetRegions', { iso2Code });

// Company Service
export const getCompaniesGrpc = () => promisifyGrpcCall(companyClient, 'GetAllCompanies');
