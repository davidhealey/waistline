# Material Icons

Material design icon font and CSS framework for self hosting the icons.

> This package contains only the icon font and required CSS. So it is considerably smaller than the official `material-design-icons` package and easy to install.

- [Installation](#installation)
- [Usage](#usage)
- [Available Icons](#available-icons)

## Installation

Download the [latest release] or install using npm:

```
npm install material-icons
```

## Usage

Font files are present in the [`iconfont`][iconfont] directory and can be imported using CSS.

Import CSS:

```html
<link rel="stylesheet" href="/path/to/material-icons/iconfont/material-icons.css">
```

To display an icon, use:

```html
<span class="material-icons">home</span>
```

To display outlined, round, sharp and two tone icons, use:

```html
<span class="material-icons-outlined">home</span>
<span class="material-icons-round">home</span>
<span class="material-icons-sharp">home</span>
<span class="material-icons-two-tone">home</span>
```

To customize the build, import Sass instead of CSS:

```scss
@import 'material-icons/iconfont/material-icons.scss';
```

If you are using webpack sass-loader, use:

```scss
$material-icons-font-path: '~material-icons/iconfont/';

@import '~material-icons/iconfont/material-icons.scss';
```

Available Sass variables:

```scss
$material-icons-codepoints: () !default; /* Sass map of icon names and codepoints */
$material-icons-font-path: '' !default;
$material-icons-font-name: 'MaterialIcons-Regular' !default;
$material-icons-font-size: 24px !default;
$material-icons-font-family: 'Material Icons' !default;
```

Available Sass mixins:

```scss
.material-icons {
  @include material-icons();
}
```

## CSS Classes (Optional)

Alternatively, you may use CSS classes to display an icon.

> **Note:** This method is not recommended as it requires a large CSS file to be imported in addition to above files. Also it might not work with some icons as Google hasn't updated codepoints for new icons.

Import CSS:

```html
<link rel="stylesheet" href="/path/to/material-icons/css/material-icons.min.css">
```

To display an icon, use:

```html
<span class="mi mi-face"></span>
```

To customize the build, import Sass instead of CSS:

```scss
@import 'material-icons/css/material-icons.scss';
```

If you are using webpack sass-loader, use:

```scss
@import '~material-icons/css/material-icons.scss';
```

Available Sass variables:

```scss
$material-icons-css-prefix: 'mi' !default;
$material-icons-css-search: '_' !default;
$material-icons-css-replace: '-' !default; /* To replace '_' with '-' in CSS class names */
```

Available Sass mixins:

```scss
.mi-face {
  @include material-icon('face');
}
```

## Available Icons

See [demo].

[latest release]: https://github.com/marella/material-icons/releases
[iconfont]: https://github.com/marella/material-icons/tree/master/iconfont
[demo]: https://marella.github.io/material-icons/demo/
