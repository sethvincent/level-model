# level-model change log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## 2.0.4

### Added
- examples directory
- browser example
- basic usage example
- use standard

### Changed
- moved tests to tests/index.js
- using memdb

## 2.0.3 - 2015-10-19

### Added
- add CONDUCT.md  
- add CONTRIBUTING.md
- add CHANGELOG.md
- add LICENSE.md
- add .travis.yml

### Changed
- updated README.md
- updated deps

## 2.0.2 - 2015-10-19

### Fixed
- fix timestamps bug when trying to turn them off 

## 2.0.0

### Changed
- v2.0.0 call beforeCreate method before applying defaults

## 1.5.3
### Changed
- allow specifying the key

## 1.5.2

### Added
- add key to schema properties

## 1.5.1

### Changed
- error if not found in findOne() method  
- run beforeCreate before validation, add validation to update method, improve validation error message  

## 1.4.0

### Changed
- ensure default values are created  
- only concat key if not already required  

## 1.3.0
### Added
 - beforeCreate and beforeUpdate methods

### Fixed
- fix required property error

## 1.2.1
### Changed
- update level-simple-indexes

## 1.2.0 
### Added
– add findOne method

## 1.1.2
### Fixed
- fix filter stream  

## 1.1.1  
### Changed
- simplify schema setup code in constructor  

## 1.1.0
### Changed
– refactor to make options object more flexible  

## 1.0.0
### Added
- initial implementation!
 