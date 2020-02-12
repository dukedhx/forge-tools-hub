[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)
[![Standard](https://img.shields.io/badge/Standard-Style-green.svg)](https://github.com/standard/standard)
[![Autodesk Forge](https://img.shields.io/badge/Autodesk-Forge-orange.svg)](https://forge.autodesk.com/)

## Live Demo

https://bxfmy.sse.codesandbox.io/

## Description

A curated collection of Forge tools with boilerplate code to build SSR Forge apps:

- SVF Saver: Download SVF files for an extracted model from Forge with Service Worker capturing the derivatives as Viewer renders the model- Downloader: Download a derivative or any web resource in chunks (so the request won't get timed out) and in parallel for better efficiency- HTTP Requester: Effortlessly make any (browser supported) HTTP requests to execute simple tasks like access tokens, model translation etc - Derivative Downloader: Parse a derivative manifest for an extracted model on Forge and download selected derivatives (SVF or other supported formats)
- PWA: Cache and view models offline - PWA ready
- Uploader: Upload an object in paralleled chunks - requires the recipient service to explicitly expose forbidden headers if needed
- Viewer Options Generator: Generate all possibile Viewer init/load options such as transform metrics easily ...
- Tutorial/Playground: Curated collection of interactive Forge tutorials & playgrounds

## Prerequisites

- Install [Node.js](https://nodejs.org/en/download/)

## Live Demo

![pwa](assets/pwa.gif)

![downloader](assets/downloader.gif)

## Running Locally

- clone this project
- `npm install`
- `npm run dev`

## SSR

- `npm run generate`

## //TODO

## License

[MIT](http://opensource.org/licenses/MIT)

## Written By

[Bryan Huang](https://www.linkedin.com/in/bryan-huang-1447b862) - Forge Partner Development https://forge.autodesk.com
