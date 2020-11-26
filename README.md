# d.velop cloud SDK for Node.js

This is the official SDK to build Apps for [d.velop cloud](https://www.d-velop.de/cloud/) using 
the [Node.js](https://nodejs.org/en/).

The project has beta status. **So for now expect things to change.** 

## Installing

TBD

## Coding
This project uses [TypeScript](https://www.typescriptlang.org/) a kind of next gen typed superset of JavaScript.
If you are new to TypeScript pleas have a look at the *Get Started* section of the 
[TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html).

## Build
This is a multi-package repository which uses 
[TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html#composite).

The build process can be invoked with `npm run <command>` and supports the following commands:

- `test` run the tests
- `watch-test` watch for changes and automatically rerun tests
- `build` incremental build, that is build all files which were changed since the last invocation
- `watch` watch for changes and automatically build the corresponding files
- `cleanbuild` force a clean build

It can be invoked for the whole repository or an individual [package](./packages) be switching to the corresponding
package directory.

```
# build all packages
npm run build

# build the tenant package only
cd packages\tenant
npm run build
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct,
and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see 
the [releases on this repository](https://github.com/d-velop/dvelop-sdk-node/releases).

## Projectstructure
We didn't want to put everything in one big package because not everybody needs all functions of the SDK.
On the other hand multiple git repositories are unnecessary overhead. So we decided to use a single git project
for all SDK packages. Furthermore we decided to use independent versioning because a breaking change
in one package, requiring a new major version for this package, would also result in a new major version for all packages
although there might be no breaking changes in these packages.   
The corresponding tool for this so called multi-package repository is [lerna.js](https://lerna.js.org/).
Please read through its documentation to get a basic understanding of how this tool works. 

## License

Please read [LICENSE](LICENSE) for licensing information.

## Acknowledgments

Thanks to the following projects for inspiration

* [Starting an Open Source Project](https://opensource.guide/starting-a-project/)
* [README template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2)
* [CONTRIBUTING template](https://github.com/nayafia/contributing-template/blob/master/CONTRIBUTING-template.md)