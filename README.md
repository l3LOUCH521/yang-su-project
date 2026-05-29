## Prerequisites

First, make sure that "pnpm" and "turbo" is installed in your computer. If not, please follow installation instructions for pnpm. If turbo is not installed, please install it using pnpm with the following command:

Then, run the following command to install turborepo.

```
pnpm add -g turbo
```

## Installing the project

Once the pnpm is installed, in the root of the project install the packages

```
pnpm i
```

To run end to end tests you need to install headless browsers. Please run the following command in the `tests/playwright-web` directory

```
pnpx playwright install
```

## Environment

In all packages `apps/admin` and `packages/db` find `.env.example` files and copy them to `.env`. Set your environment variables accordingly!

## Database
under the packages/db folder please run the following code to set up the database
```
npx prisma generate
```
```
npx prisma db push
```
```
npx tsc
```
```
node prisma/seed.mjs
```

## Running the project

To run the project, run the following command in the root directory of your project:

```
turbo dev
```

This will run:

- Client application at [http://localhost:3001](http://localhost:3001)
- Admin application at [http://localhost:3002](http://localhost:3002)

## Running tests

To run the tests please run

```
turbo test-1
```
```
turbo test-2
```
```
turbo test-3
```
```
turbo test-4
```
## Default credentials
admin password: 123
