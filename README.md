# n8n-nodes-ocean

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node for [Ocean.io](https://ocean.io) - the leading platform for lookalike company and people discovery.

[Ocean.io](https://ocean.io) helps businesses find their ideal customers by discovering companies and people similar to their best prospects. This n8n node brings Ocean.io's powerful lookalike discovery and data enrichment capabilities directly into your automation workflows.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-ocean`
4. Agree to the risks of using community nodes
5. Select **Install**

After installation restart n8n to register the new nodes.

## Features

This node provides **complete coverage** of the Ocean.io API with 13 operations across 5 resources:

- ✅ **Company** (2 operations): Search and enrich company data
- ✅ **Person** (2 operations): Search and enrich people data
- ✅ **Reveal** (2 operations): Reveal emails and phone numbers
- ✅ **Autocomplete** (4 operations): Get suggestions for companies, job titles, keywords, and skills
- ✅ **Other** (3 operations): Credit balance, data fields, and company warmup

**100% API Coverage** - All Ocean.io API endpoints are implemented!

## Operations

### Company Resource

#### Search Companies (1 credit per company)
Find lookalike companies using Ocean.io's discovery engine. This is Ocean.io's core functionality for discovering companies similar to your ideal customers.

**Key Features:**
- **Lookalike Discovery**: Provide example company domains to find similar companies
- **Advanced Filtering**: Filter by employee count, industry, location, and more
- **Pagination Support**: Handle large result sets efficiently

**Parameters:**
- `Lookalike Domains`: Comma-separated list of company domains to find similar companies to
- `Company Name`: Search for companies by name (partial matches supported)
- `Domain`: Search for a specific company domain
- `Employee Count`: Filter by minimum and maximum employee count
- `Countries`: Filter by specific countries
- `Industries`: Filter by specific industries

#### Enrich Company (1 credit with domain, 5 credits without)
Enhance existing company data with Ocean.io's comprehensive database.

**Parameters:**
- `Domain`: Company domain to enrich (recommended for lower cost)
- `Company Name`: Company name to enrich

### Person Resource

#### Search People (1-3 credits per person)
Find lookalike people using Ocean.io's discovery engine. Perfect for finding decision-makers and prospects similar to your best customers.

**Key Features:**
- **Lookalike Discovery**: Provide example LinkedIn handles to find similar people
- **Job Title Filtering**: Target specific roles and seniority levels
- **Company Filtering**: Find people at specific companies or similar companies

**Parameters:**
- `Lookalike People`: Comma-separated list of LinkedIn handles to find similar people to
- `Person Name`: Search for people by name
- `Job Titles`: Filter by specific job titles
- `Company Domains`: Find people from specific companies
- `Countries`: Filter by location

#### Enrich Person (3 credits per person)
Enhance individual prospect data with Ocean.io's database.

**Parameters:**
- `Email`: Email address to enrich
- `LinkedIn Handle`: LinkedIn handle (the part after linkedin.com/in/)
- `Person Name`: Full name of the person to enrich

### Reveal Resource

#### Reveal Emails (1 email credit per person)
Reveal and verify email addresses for people. This operation uses your email credits pool.

**Key Features:**
- **Batch Processing**: Reveal multiple emails in a single request
- **Verification**: Returns verification status for each email
- **Multiple Identifiers**: Use LinkedIn handle, name, or company domain

**Parameters:**
- `People`: List of people to reveal emails for
  - `LinkedIn Handle`: LinkedIn handle (e.g., john-doe)
  - `Person Name`: Full name of the person
  - `Company Domain`: Company domain to help identify the person

#### Reveal Phones (1 phone credit per person)
Reveal and verify phone numbers for people. This operation uses your phone credits pool.

**Key Features:**
- **Batch Processing**: Reveal multiple phone numbers in a single request
- **Verification**: Returns verification status for each phone number
- **Multiple Identifiers**: Use LinkedIn handle, name, or company domain

**Parameters:**
- `People`: List of people to reveal phone numbers for
  - `LinkedIn Handle`: LinkedIn handle (e.g., john-doe)
  - `Person Name`: Full name of the person
  - `Company Domain`: Company domain to help identify the person

### Autocomplete Resource

Autocomplete is a **synchronous lookup helper** — you send partial text, Ocean returns matching suggestions immediately in the same run (no webhook). It does **not** return full company/person profiles, emails, or phone numbers. Use the suggestions as input to Search or Enrich in the next step.

**Credit cost:** 0.1 credits per API call (flat rate per run, not per suggestion). Uses your main Ocean credit balance. Much cheaper than Search or Enrich, so it is useful for fixing messy CRM/spreadsheet values before a paid step.

#### Autocomplete Companies (0.1 credits/call)
Returns up to 15 matches with `name` and `domain` (e.g. `stripe.com`). Use the domain for Enrich Company or Lookalike Domains in Search.

**Parameters:**
- `Query`: Beginning of the company name or domain

#### Autocomplete Job Titles (0.1 credits/call)
Returns up to 15 job title strings. Pass a match into Search People → Job Titles.

**Parameters:**
- `Query`: Beginning of the job title

#### Autocomplete Keywords (0.1 credits/call)
Returns up to 15 keyword strings for company search filters (Companies Filters JSON).

**Parameters:**
- `Query`: Beginning of the keyword

#### Autocomplete Skills (0.1 credits/call)
Returns up to 15 skill strings for people search filters (People Filters JSON).

**Parameters:**
- `Query`: Beginning of the skill

#### Autocomplete Locations (0.1 credits/call)
Returns up to 15 city/region strings for location filters.

**Parameters:**
- `Query`: Beginning of the location name

### Other Resource

#### Get Credit Balance (Free)
Monitor your Ocean.io API credit usage and remaining balance.

**Returns:**
- Standard credits balance
- Email credits balance (for email reveal operations)
- Phone credits balance (for phone reveal operations)

#### Get Data Fields (Free)
Retrieve all valid data fields for Ocean.io searches. Returns industries, technologies, regions, seniorities, departments, and more.

**Use Cases:**
- Build dynamic dropdowns in your application
- Validate search parameters before making requests
- Discover available filter options

**Returns:**
- Industries list
- Technologies list
- Regions/countries list
- Seniorities list
- Departments list
- And more...

#### Warmup Companies (Free)
Pre-load company data for faster subsequent searches. Useful for large-scale operations.

**Parameters:**
- `Company Domains`: Comma-separated list of company domains to warmup

**Use Cases:**
- Prepare data before bulk enrichment operations
- Optimize performance for frequently accessed companies
- Reduce latency for time-sensitive workflows

## Authentication

This node uses Ocean.io's API key authentication. You can find your API key in your Ocean.io dashboard under **Settings > API Keys**.

1. In n8n, create new credentials of type "Ocean.io API"
2. Enter your Ocean.io API key
3. Save the credentials

## Credit Costs

Ocean.io operations consume credits from your account:

### Standard Credits
- **Company Search**: 1 credit per company returned
- **Company Enrich**: 1 credit (with domain) or 5 credits (without domain)
- **People Search**: 1-3 credits per person (depending on lookalike usage)
- **Person Enrich**: 3 credits per person
- **Autocomplete** (all types): 0.1 credits per call

### Email Credits
- **Reveal Emails**: 1 email credit per person

### Phone Credits
- **Reveal Phones**: 1 phone credit per person

### Free Operations
- **Credit Balance**: Free
- **Get Data Fields**: Free
- **Warmup Companies**: Free

## Example Workflows

### Find Lookalike Companies
1. Use **Company > Search Companies**
2. Set `Lookalike Domains` to your best customer domains (e.g., "stripe.com, shopify.com")
3. Add filters for employee count, industry, or location as needed
4. Process results for lead generation or market research

### Enrich CRM Data
1. Use **Company > Enrich Company** or **Person > Enrich Person**
2. Provide domain/email/LinkedIn handle from your CRM
3. Merge enriched data back into your CRM system

### Reveal Contact Information
1. Use **Person > Search People** to find prospects
2. Use **Reveal > Reveal Emails** to get verified email addresses
3. Use **Reveal > Reveal Phones** to get verified phone numbers
4. Export to your CRM or outreach tool

### Build Dynamic Search Forms
1. Use **Autocomplete > Autocomplete Companies** for company name suggestions
2. Use **Autocomplete > Autocomplete Job Titles** for role suggestions
3. Use **Other > Get Data Fields** to populate industry/technology dropdowns
4. Create user-friendly search interfaces with validated inputs

### Optimize Bulk Operations
1. Use **Other > Warmup Companies** to pre-load company data
2. Run bulk enrichment operations with reduced latency
3. Monitor performance improvements for frequently accessed companies

### Monitor Credit Usage
1. Use **Other > Get Credit Balance** before expensive operations
2. Set up conditional logic to prevent workflows from running when credits are low
3. Send alerts when credit balance drops below threshold
4. Track email and phone credit usage separately

## Rate Limits

Ocean.io API has a rate limit of 300 requests per minute. The node handles rate limiting automatically and will retry failed requests when appropriate.

## Error Handling

The node provides detailed error messages for common issues:
- Insufficient credits
- Invalid API key
- Validation errors
- Rate limiting

Enable "Continue on Fail" in your workflow to handle errors gracefully.

## Resources

- [Ocean.io API Documentation](https://docs.ocean.io/)
- [Ocean.io Dashboard](https://app.ocean.io/)
- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](https://github.com/bcharleson/n8n-nodes-ocean/blob/master/LICENSE.md)

## Support

For issues with this n8n community node, please [open an issue](https://github.com/bcharleson/n8n-nodes-ocean/issues) on GitHub.

For Ocean.io API support, contact [Ocean.io support](https://ocean.io/support).
