[![build status](https://secure.travis-ci.org/bebraw/reactabular.png)](http://travis-ci.org/bebraw/reactabular)
# Reactabular - Spectacular tables for React.js

Reactabular has been designed to make it easier to build tables on top of React.js. Basic things, such as displaying data, are possible. More complex scenarios, such as search, pagination, sorting and inline editing, are supported.

The library has been designed so that it is possible for you to extend it without having to stab at the core. Instead you can develop widgets around it and connect the component to your software architecture (Flux etc.) using callbacks.

This means it might take more code to achieve certain things than in various other alternatives. On the other hand it gives you a degree of freedom you might appreciate. In addition it keeps the library quite small and easier to maintain.

## Basic Table

A basic table without any bells and whistles can be created like this:

```javascript
var Table = require('reactabular').Table;

...
```

And when rendering you could do:

```jsx
<Table columns={columns} data={data}></Table>
```

Column and data definition looks like this:

```javascript
var data = [
    {
        name: 'React.js',
        type: 'library',
        description: 'Awesome library for handling view.',
    },
    {
        name: 'Angular.js',
        type: 'framework',
        description: 'Swiss-knife of frameworks. Kitchen sink not included.',
    },
    {
        name: 'Aurelia',
        type: 'framework',
        description: 'Framework for the next generation',
    },
];

var columns = [
    {
        property: 'name',
        header: 'Name',
    },
    {
        property: 'type',
        header: 'Type',
    },
    {
        property: 'description',
        header: 'Description',
    },
];
```

Using these definitions you should end up with a simplistic table with some library and framework data.

`data` is simply an array of objects. `columns` provides column definition for the table and maps `data` fields to it using `property` key. `header` is used for UI. You could inject i18n'd versions of headers there etc.

## Formatted Table

As just listing libraries and frameworks is boring, let's add some more data to it. We could fetch information such as followers from GitHub. I'll leave that as an exercise to the reader and just add that data to the definition. In addition we could add a boolean there to signify projects that work with Reactabular out of the box. Here's an expanded definition:

```javascript
var data = [
    {
        name: 'React.js',
        type: 'library',
        description: 'Awesome library for handling view.',
        followers: 23252,
        worksWithReactabular: true,
    },
    {
        name: 'Angular.js',
        type: 'framework',
        description: 'Swiss-knife of frameworks. Kitchen sink not included.',
        followers: 35159,
        worksWithReactabular: false,
    },
    {
        name: 'Aurelia',
        type: 'framework',
        description: 'Framework for the next generation.',
        followers: 229,
        worksWithReactabular: false,
    },
];
```

In addition we might want to improve the formatting of these new fields. Here's an expanded column definition (new fields only):

```javascript
var columns: [
    ...
    {
        property: 'followers',
        header: 'Followers',
        // accuracy per hundred is enough for demoing
        formatter: (followers) => followers - (followers % 100),
    },
    {
        property: 'worksWithReactabular',
        header: '1st Class Reactabular',
        // render utf ok if works
        formatter: (works) => works && <span>&#10003;</span>,
    }
];
```

`formatter` is expected to return some value or a React component so there is room for customization.

It might be cool if it was possible to search the content, especially if we added more data there. Let's implement that next.

## Searching a Table

`Reactabular` comes with a search helper that can be hooked up. See below:

```javascript
var Search = require('reactabular').Search;

...

getInitialState() {
    return {
        ...
        searchData: data,
        ...
    };
}
```

Then at your `render` you could do:

```jsx
<div className='search-container'>
    Search <Search columns={columns} data={data} onResult={this.setState.bind(this)}></Search>
</div>
```

You should also wire `Table` to use filtered data:

```jsx
<Table columns={columns} data={this.state.searchData}></Table>
```

The interesting bit here is `this.setState.bind(this)`. When you enter something to the search field, it will emit a structure like this:

```js
{
    searchData: [...], // a list of matching rows
}
```

In order to take these changes in count, you will need to update the table state. Hence it is preferable to set up table `data` and `columns` at `getInitialState`. Alternatively you could hook into some implementation of Flux here.

## Paginating a Table

The next natural step could be implementing a pagination for our table. We could add two separately controls for that. One to display amount of items per page and one to control the current page. This will take some additional wiring.

The library doesn't come with pagination. Instead you can use an external library, such as [react-pagify](https://github.com/bebraw/react-pagify), for this purpose. Here's a brief example on how to set it up with `reactabular`:

```javascript
var Paginator = require('react-pagify');

require('react-pagify/style.css');

...

// state
pagination: {
    page: 0,
    perPage: 10
},

// handlers
onSelect(page) {
    var pagination = this.state.pagination || {};

    pagination.page = page;

    this.setState({
        pagination: pagination
    });
},

onPerPage(e) {
    var pagination = this.state.pagination || {};

    pagination.perPage = parseInt(event.target.value, 10);

    this.setState({
        pagination: pagination
    });
},
```

You could push some of that into a mixin to decrease the amount of code in your components.

```jsx
<div className='per-page-container'>
    Per page <input type='text' defaultValue={pagination.perPage} onChange={this.onPerPage}></input>
</div>

...

<div className='pagination'>
    <Paginator
        page={paginated.page}
        pages={paginated.amount}
        beginPages='3'
        endPages='3'
        onSelect={this.onSelect}></Paginator>
</div>
```

In addition we need to change `Table` `data` field to point at `paginated.data` like this:

```jsx
<Table columns={columns} data={paginated.data}></Table>
```

After these steps we should have pagination in our table. Pagination is simply a filtering step on data.

We are still missing one basic feature - sorting. We'll implement that next.

## Sorting a Table

Reactabular comes with a little helper to make this task easier. It is possible to replace the provided sorter with something more advanced. Here's the basic idea:

```javascript
var sortColumn = require('reactabular').sortColumn;

...

var header = {
    onClick: (column) => {
        sortColumn(
            this.state.columns,
            column,
            this.state.searchData,
            this.setState.bind(this)
        );
    },
};
```

In addition we need to provide `header` to our `Table` like this:

```jsx
<Table columns={columns} data={paginated.data} header={header}></Table>
```

After that it should be possible to sort table content by hitting various column names at header. `sortColumn` sets either `sort-asc` or `sort-desc` class for currently active header column. This allows some degree of styling.

You can get something basic looking by utilizing `./style.css`. In Webpack you can import it to your project using `require('reactabular/style.css')` provided you have appropriate loaders set up.

> `header` key-value pairs will be applied as attributes to `th`'s. If you have an event handler (ie. something starting with `on`), the first parameter provided will be the column in question. The second one will be React event.

## Adding a Custom Column

It might be fun if it was possible to delete table entries directly. We can define custom column with a delete button for this purpose. A definition such as follows should work:

```javascript
{
    cell: (value, data, rowIndex, property) => {
        var remove = () => {
            // this could go through flux etc.
            this.state.data.splice(rowIndex, 1);

            this.setState({
                data: this.state.data
            });
        };

        return {
            value: <span>
                <span onClick={remove.bind(this)} style={{cursor: 'pointer'}}>&#10007;</span>
            </span>
        };
    },
},
```

It would be possible to add a confirmation there etc. but you get the idea. Besides the property and current value, the cell handler gets the row and column indices. That information can then be used to get rid of the row and update the state. You can also use the combination of indices to keep track of state per cell.

## Adding a Custom Footer

Adding a custom footer for our table is simple. Just write the definition inside `Table` itself. In this particular case it's not very useful but you could easily generate things like sums and such here.

```jsx
<Table columns={columns} header={header} data={paginated.data}>
    <tfoot>
        <tr>
            <td>
                You could show sums etc. here in the customizable footer.
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    </tfoot>
</Table>
```

## Inline Editing a Table

As you noticed in the custom column section above, Reactabular provides access to table cell rendering. You could implement various cell customizations on top of this. To make it easier to implement custom editors, Reactabular comes with a little shortcut. Here's an example:

```javascript
var cells = require('reactabular').cells;
var editors = require('reactabular').editors;

...
// bind context at getInitialState
var createEditCell = cells.edit.bind(this);

...

{
    property: 'estimatedValue',
    header: 'Estimated value',
    formatter: (estimatedValue) => parseFloat(estimatedValue).toFixed(2)
    cell: createEditCell({
        editor: editors.input(),
    }),
},
```

After you have a declaration like this, the column cells will be editable. It is possible to set up custom formatting if needed. Both `editor` and `formatter` are optional so you skip either if you want.

The library comes with a couple of basic editors. As long as you follow the same interface (`value`, `onValue` properties), your editor should just work with the system.

## Development

```
npm install
npm start
open http://localhost:3000
```

Now edit `demos/app.js`.

Your changes will appear without reloading the browser like in [this video](http://vimeo.com/100010922).

## Contributors

* [Brian Chang](https://github.com/eviltoylet) - Fixed README formatting examples. Improved `column.cell` architecture.

## Acknowledgments

Based on [react-hot-boilerplate](https://github.com/gaearon/react-hot-boilerplate) (MIT) by Dan Abramov.

## License

MIT. See LICENSE for details.
