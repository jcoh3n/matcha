// Runs before any test module is imported. Force the suite to use a dedicated
// test database so it never touches development/production data (the suites
// TRUNCATE/DELETE tables in beforeEach).
process.env.NODE_ENV = "test";
process.env.POSTGRES_DB = "matcha_test";
process.env.DB_NAME = "matcha_test";
