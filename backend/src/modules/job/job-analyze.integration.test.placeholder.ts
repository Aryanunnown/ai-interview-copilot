/**
 * JD Intelligence Refactor — Integration Test Placeholder
 *
 * Scenarios to implement:
 *
 * 1. Full analyze flow
 *    - Upload a resume first
 *    - POST /job/analyze with a JD text
 *    - Verify JobDescription is created in DB
 *    - Verify response contains all required fields
 *
 * 2. Persistence
 *    - Verify parsedProfile is stored correctly
 *    - Verify analysisSource is stored correctly
 *    - Verify requiredSkills/preferredSkills are stored
 *
 * 3. Resume not found
 *    - Use non-existent resumeId
 *    - Verify 404 response
 *
 * 4. Ownership check
 *    - Use another user's resumeId
 *    - Verify 404 response
 */
