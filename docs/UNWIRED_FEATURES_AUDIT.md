# Unwired Features & Architecture Audit - 2026-02-01

**Purpose:** Comprehensive inventory of disconnected components, unimplemented services, and TODOs.
**Status:** In Progress
**Reference:** [MANDATORY] This file must be updated whenever a feature is partially implemented.

---

## 🚨 Critical Unwired Components
*(Components that exist but are not connected to logic/data)*

- [ ] **Frontend Entry Point**: React Application not yet initialized (Current: Lit).
- [ ] **Smart Property Import**: Agent logic exists but is not wired to Real Estate extraction schemas.
- [ ] **Mapbox Integration**: Library not installed; Map view missing.

## 🔌 API Integration Stubs
*(Services waiting for API keys or endpoints)*

- [ ] **Firebase Auth**: Configured but not connected to React Context.
- [ ] **Firestore Service**: Repository layer missing.

## 📝 Pending Automation Handlers
*(Action handlers defined but empty)*

- [ ] `extractPropertyFromUrl`: Needs implementation using Gemini/OpenAI.
- [ ] `geocodeAddress`: Needs Mapbox/Google Maps integration.

## 🐛 Known TODOs (Legacy)
*(Items inherited from OpenClaw that need review for Real Estate relevance)*

- [ ] Review `packages/gateway` for reusable patterns.
