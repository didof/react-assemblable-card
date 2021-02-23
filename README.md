In this first post of a series, I begin the implementation of a composable React component.

It is a Card that can be _expanded_ with sub-components thanks to the **Compound Pattern**

As a picnic basket, it will be a component with everything you need inside

It can be used like this
![composable card usage](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7b72g5b7z49r5frpi25s.png)

Take a look at the [code](https://github.com/didof/react-assemblable-card) or let's get started

#### Init

- project created with `npx create-react-app`
- streamlining to the essentials

---

#### Chapter I - The Foundation

I create a components folder. Inside there is a card folder. So here `Card.js`

```bash
mkdir src/components
mkdir src/components/card
touch src/components/card/Card.js
```

In the latter I define a _class component_

###### Card.js

```js
import React from 'react'
import './style.css'

class Card extends React.Component {
  render() {
    return <article className='card'>{this.props.children}</article>
  }
}

export default Card
```

And its simple style

```css
.card {
  width: 200px;
  height: 150px;
  background-color: antiquewhite;
  border-radius: 5px;
}
```

> I make it clear. I use the CSS for simplicity's sake; in a real project I definitely recommend an alternative (i.e. [scss/sass](https://sass-lang.com/), [styled-components](https://styled-components.com/))

So far nothing new. Anything passed in `<Card>` would be rendered inside a colored rectangle

I decide it's time to make the component extendable:
`mkdir src/components/card/extentions`

There are only four types of extensions available at the moment:

- Header - `touch src/components/card/extentions/Header.js`
- Image - `touch src/components/card/extentions/Image.js`
- Description - `touch src/components/card/extentions/Description.js`
- Footer - `touch src/components/card/extentions/Footer.js`

For each I create a simple functional component (I show only the header to be synthetic)

###### extentions/Header.js

```js
const Header = ({ children }) => {
  return <header>{children}</header>
}

export default Header
```

So I adopt the **Compound Pattern** in `Card.js`:

- I import the sub-components
- I associate each one with a **static property** of the same name in the Card component

> This simple possibility made me think again about the usefulness of class components

###### Card.js

```js
import Header from './extentions/Header'
import Image from './extentions/Image'
import Description from './extentions/Description'
import Footer from './extentions/Footer'

class Card extends React.Component {
  static Header = Header
  static Image = Image
  static Description = Description
  static Footer = Footer

  render() {
    return <article className='card'>{this.props.children}</article>
  }
}
```

So I use this component somewhere

###### App.js (detail)

```html
<Card>
  <Card.Header>I am the Header</Card.Header>
  <Card.Description>Bio</Card.Description>
  <Card.Footer>On the ground</Card.Footer>
  <Card.Header>Header - again?</Card.Header>
</Card>
```

And actually, the various sub-components will be inserted into the parent component

I draw some observations:

- The order in which the sub-components are inserted determines the order in which they are rendered
- The presence of a sub-component is independent of that of the others
  - I can omit one or more (or all)
  - I can add an indefinite number
- The logic and style of each sub-component is limited within it

---

#### Chapter II - Census

It's time to set some rules. I want each Card to respect a certain type of structure: maximum one Header, maximum one Footer, at (for the moment) no Image. However, I grant 2 Descriptions.

I need that even before the Card is mounted, a census of its sub-components takes place to ensure that this directive is respected.

In the component Card I add the following constructor

###### Card.js (detail)

```js
constructor(props) {
    super(props)

    React.Children.forEach(props.children, child => {
      console.log(child)
    })
  }
```

For each sub-component I get a log like

```js
{
  $$typeof: Symbol(react.element),
  key: null,
  ref: null,
  props: { children: "I am the Header" },
  type: {
    ...
    name: "Header"    // <--- !!!
  }
  ...
}
```

> So `child.type.name` corresponds to a string representing the sub-component associated with the child

Now that I know how to identify children, I need to define a configuration object that represents the _card blueprint_

```bash
touch src/components/card/config.js
```

###### config.js

```js
export const blueprint = {
  Header: 1,
  Image: 0,
  Description: 2,
  Footer: 1,
}
```

> The usefulness of the first capital letter will be explained in a few lines.

So I'm going to define a helper method that will come in very useful in a little while

```bash
mkdir src/utils
touch src/utils/getBlankInstance.js
```

###### getBlankInstance.js

```js
const getBlankInstance = (template, initialValue = 0) => {
  return Object.keys(template).reduce((blank, extention) => {
    blank[extention] = initialValue
    return blank
  }, {})
}

export default getBlankInstance
```

What it does is receive a template (it will be the _blueprint_) and return an object with the same properties but with all values ​​at 0 (optionally any other value that might be useful.)

Finally, I'm going to take a census of the children. Again I operate as a helper

```bash
touch src/utils/registerChildren.js
```

The `registerChildren` method takes two parameters:

1. the blueprint to refer to
1. the actual list of children to be reviewed

The first thing it does is use `getBlankInstance` based on the `blueprint` provided to it to create a counter that will be updated as children are scanned

> Since the properties of the blueprint coincide with the names of the sub-components (_the first capital letter!_) it is possible to access the properties through the notation in square brackets. If I had taken a different approach, a simple switch would have had the same effect.

###### utils/registerChildren.js

```js
import React from 'react'
import getBlankInstance from './getBlankInstance'

const registerChildren = (blueprint, children) => {
  const counter = getBlankInstance(blueprint)

  React.Children.forEach(children, child => {
    const { name } = child.type

    counter[name]++
  })

  console.log(counter)
}

export default registerChildren
```

In `Card.js` I import the function and the blueprint it needs. So I use them in the constructor

###### Card.js (details)

```js
import registerChildren from '../../utils/registerChildren'
import { blueprint } from './config'

...

constructor(props) {
    super(props)

    const { children } = props
    if (!children) return

    registerChildren(blueprint, props.children)
  }
```

Changing the amount of sub-components (I'm referring to what happens in `App.js`, where the Card component is used) I notice that the counter actually keeps track of the children and categorizes them. The only thing missing is to check that the counter respects the blueprint and that's it.

###### registerChildren.js

```js
const registerChildren = (blueprint, children) => {
  const counter = getBlankInstance(blueprint)

  React.Children.forEach(children, child => {
    const { name } = child.type

    counter[name]++
  })

  const anomalies = Object.keys(blueprint).filter(extention => {
    return counter[extention] > blueprint[extention]
  })

  if (Boolean(anomalies.length)) {
    throw new Error(`The structure used does not respect the blueprint.
    Please check ${anomalies.join(' ')}`)
  }

  return counter
}
```

So for each property of the blueprint I check that the respective value in the counter does not exceed that indicated by the blueprint. If so, the anomalous property is placed in `anomalies`. If the list of anomalies is not zero, the use of the sub-components is not respected - error time!
Otherwise, I return the item, it might come in handy

> The error provides an indication to who was using it erroneously, indicating in the message what the anomalies are

> Since the blueprint is received from the outside, this same function would be usable in a totally new component

> It is assumed that the children of Card are always the predisposed sub-components. Using any other tag (at the moment) would break the script as it would lack the name attribute under type. There is a way around this little hurdle and I'll cover it in a future post - _coff_ **Context API** _coff_

---

#### Interlude I - I Fought the Law and the Law Won

Keeping in mind that the blueprint is

###### config.js

```js
export const blueprint = {
  Header: 1,
  Image: 0,
  Description: 2,
  Footer: 1,
}
```

Where I use the Card component

###### App.js (detail)

```js
<Card>
  <Card.Header>Twin</Card.Header>
  <Card.Image>I should not be here</Card.Image>
  <Card.Header>Peaks</Card.Header>
</Card>
```

And I am overwhelmed by the error:
`Error: The structure used does not respect the blueprint. Please check Header Image`.

---

#### Enhancement Break - Just the way I want it

It is true that it is not possible to insert more sub-components than those foreseen for a given category. However, it is also true that at the moment it is possible to use a smaller number or even omit them altogether. Anything wrong.
However, if I wanted to be worse I would accept a third parameter _strict_ which, if it were _true_, would report as an anomaly any category that does not perfectly comply with the blueprint indications

###### utils/registerChildren (strict version)

```js
const registerChildren = (blueprint, children, strict = false) => {
  ...

  const anomalies = Object.keys(blueprint).filter(extention => {
    if (strict) return counter[extention] !== blueprint[extention]
    return counter[extention] > blueprint[extention]
  })

  ...
```

In this case, the only use of Card would be

###### App.js (detail)

```js
<Card>
  <Card.Header>header</Card.Header>
  <Card.Description>description 1</Card.Description>
  <Card.Description>description 2</Card.Description>
  <Card.Footer>footer</Card.Footer>
</Card>
```

It may or may not be useful, it only costs a boolean.

---

Thanks for reading, see you soon with the next chapters

Repo that I update as I write this series of posts:
[repo](https://github.com/didof/react-assemblable-card)

If you like it, let's get in touch
[GitHub](https://github.com/didof/)
[Twitter](https://twitter.com/did0f)
[Linkedin](https://www.linkedin.com/in/francesco-di-donato-2a9836183/)
