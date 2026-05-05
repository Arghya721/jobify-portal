// Shared resolver so any component can start a view transition
// that resolves via the layout-level ViewTransitionHandler (which persists across routes).
export const viewTransitionResolver: { current: (() => void) | null } = { current: null };
