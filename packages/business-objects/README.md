<div align="center">
  <h1>@dvelop-sdk/business-objects</h1>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/business-objects">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/business-objects?style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/business-objects">
    <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/business-objects?style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/main/LICENSE">
    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </a

  </br>

  <p>This package contains functionality for the <a href="https://dv-businessobjects-assets.s3.eu-central-1.amazonaws.com/documentation/latest/business_objects_api.html">BusinessObjects-App</a> in the d.velop cloud.</p>

  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/business-objects.html"><strong>Explore the docs »</strong></a>

  </br>

  <a href="https://www.npmjs.com/package/@dvelop-sdk/business-objects"><strong>Install via npm »</strong></a>

  </br>

  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>

</div>

## A note on datatypes in OData and Javascript
D.velop BusinessObjects uses OData as data model. When working with BusinessObject Models you can refer to the [propertyType-section](https://dv-businessobjects-assets.s3.eu-central-1.amazonaws.com/documentation/latest/business_objects_api.html#propertytype).

BO property type | Javascript type | Example
--- | --- | ---
boolean | boolean | true
string | string | "Hi it's me string"
`list<string>` | Array | ["Hi", "it's", "me", "list"]
guid | string | "ED7BA470-8E54-465E-825C-99712043E01C"
date | string |  "2011-04-17"
dateTimeOffset | string | "2011-04-17T20:00:00.000Z"
single | number* | 3.14159
double | number* | 3.14159
decimal | number* | 3.14159
int16 | number* | 42
int32 | number* | 42
int64 | number* | 42
byte | number | 255
sByte | number | -8
binary | string | "23ABFF"

_* When working with numbers please mind [Javascript Numbers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)_