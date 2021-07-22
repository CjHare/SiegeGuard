# 5DS API
The 5DS API, integrated with by customers and used by the demos and future admin/management console.

The API is available in two formats, apib and HTML.

## API Blueprint
The specification is authored in [API Blueprint](https://apiblueprint.org/) format and found in `/src`.

## HTML
HTML version is generated from the API Blueprint version and found in `/html`.

### Generation
To use [Aglio](https://www.npmjs.com/package/aglio), install locally:
`npm install`

As the Aglio is no longer active, fix the problematic dependencies:
`npm audit fix`

Generate from the apib in `src` the default theme into the `html` folder: 
`npm run generate`