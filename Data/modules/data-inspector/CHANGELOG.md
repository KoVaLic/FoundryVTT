# Change Log

## 4.3.0

- Change: Many of the used colors now use CSS variables to ease customizing the UI appearance.
- Change: Entry tooltip now uses Foundry's tooltip feature.
- Change: Objects display number of children.
- New: Entry tooltips can now be disabled in module settings (client-side setting).
- New: Display DataModel if present.
- New: Display basic data values if present (`value`, `max`, and `total`) in parent object.
- i18n: i18n keys no longer have `Koboldworks` prefix.
- i18n: All strings should now be translatable.

## 4.2.0.2

- Fix: Inspector could not be opened if the default view was something else than `source`.

## 4.2.0.1

- Fix: In RDT checks broken by 4.2

## 4.2.0

- New: Flags display mode [#25]
- Fix: Changing type to number or boolean in editor sometimes did not adjust the editor correctly [#26]

## 4.1.0

- New: Context menu option in actors and items directories, and in compendiums, to open the inspector directly.

## 4.0.2

- Fix: Derived values were invisible in DataModels. [#20]
- Fix: Collection contents were not displayed. [#21]

## 4.0.1.5

- Fix: Bad handling of DataModel contents.

## 4.0.1.4

- Fix: Cannot read fields of undefined when encountering documents or document data. [#19]

## 4.0.1.3

- Fix: Path was badly converted between modes.

## 4.0.1.2

- Change: Disabled generic system extension checking. The 404 error it generates with most systems seems to bother some users.

## 4.0.1.1

- Fix: Basic string editors could not be used if content was recognized as HTML.
- Change: Title attribute usage replaced with Foundry tooltips.
- Fix: Fix bad translation key for mode tooltip.
- Change: TinyMCE replaced with ProseMirror

## 4.0.0

- Fix: Empty data now prints proper warnings.
- New: Basic DataModel support.
- Removed support for v9 and older

## 3.1.0

- Fix: Swapping modes to and from roll data causes selected path to be formatted poorly with v10.
- Fix: Roll data mode was incorrectly identified, causing some odd behaviour.
- New release mechanism for smaller download & install sizes.

## 3.0.0

- Fix: Parent actor detection was incorrect for most systems.
- New: Override view, showing unlinked token overrides to the source actor.
- New: Foundry v10 compatibility.

## 2.2.1

- Internal: Less swapped for SCSS.
- Internal: Bundling with esbuild for faster loading.

## 2.2.0

- Added infinite loop guard for data recursion.
- Fix: Document and DocumentData found in data caused infinite loops.
- Slightly better handling of `Map`.

## 2.1.0

- New: Allow editing some unsupported types. Delete only.
- New: Source mode displays if the values are present in temporary document of same type.
  - This potentially allows you to see if you have data cruft, though this is not reliable for that, the extra data can be intentional.
- New: Hooks for enhancing how the module behaves:
  - `data-inspector.temporaryData` (document, data): For creating temporary document for data comparison. Modify data parameter to supplement document creation.
  - `data-inspector.filterData` (document, path, mode): Return false if the data at stated path should not be displayed. This is meant for dealing with secret data.
- New: The module functionality can be limited to GMs. By default users are allowed.
- Changed: Search index is built only on demand.
- New: Custom tooltips with more information and faster responsiviness.

## 2.0.0.1

- Fix: Bad data type notification displays with human readable type.
- Fix: Data sorting.

## 2.0.0

- New: Simple limited value editing and deletion interface accessible in source view. Requires this is enabled in module settings.
- New: Basic API accessible via `game.modules.get('data-inspector').api`
- New: Booleans are identified better with checkboxes to display their state.
- New: Object entries are sorted.
- New: Result quality slider to allow greater or lesser number of matches to be shown than the default when searching.
- New: Default mode can be chosen.
- New: Default inclusion of functions can be toggled.
- New: Default result quality setting can be chosen.
- Changed: Some data types are no longer icluded in the tree expansion, such as Item and Actor instances. This is to prevent infinite loops or other similar problems.
- Changed: Empty strings are treated the same as null/undefined values, fading them.
- Fixed: Dialog failing to open for systems that don't provide roll data.

## 1.2.0

- Improved: Search is better at matching good results and actually finds them.
- Improved: Header layout.

## 1.1.0

- Fixed: Bad handling of arrays.
- New: Class name is stated instead of generic object value for classes.
- New: Function listing added, adding both getters and actual functions to the data listing.
  - Getters can be resolved by clicking on their value.
- Changed: Values are colored per type and strings are surrounded with double quotes to make them all more distinct.

## 1.0.0 Initial release

- Standalone module
