# Assemblable Card

### Recap

In the first post of the series I built a Card component that can be extended with a series of sub-components using the **Compound Pattern**

However, the order in which they are inserted in the component instantiation is relevant to the order in which they are rendered. Although it is a greater degree of freedom, it is associated with various complications regarding the style and any functionality that I will implement in the following chapters

<center> ~ <b>Therefore</b> ~ </center>

The goal of this post is to obtain that, regardless of the order used in the instantiation of the card, the positioning of the sub-components is well defined

> This theme is particularly close to my heart as I want to build a product that does not force the user to open it (unless they feel like it)

I will achieve this in two steps

1. mapping of the relative references to each sub-component used
1. positioning each sub-component to its specific position within the card boundaries (in the next post)

---

#### Chapter III - Another Brick in The Wall

Using an approach similar to that adopted for the census of the sub-components and therefore of the helper methods created in the [previous post](#), I extrapolate each sub-component and store the reference in the appropriate category so that it can be reused at will at a later time

Then I proceed to group the children into a helper method

```bash
touch src/utils/groupChildren.js
```

Like `registerChildren` it is a function used in the Card constructor

###### Card.js (details)

```jsx
import groupChildren from '../../utils/groupChildren'

...

constructor(props) {
    super(props)

    const { children } = props
    if (!children) return

    registerChildren(blueprint, props.children, true)

    const groups = groupChildren(blueprint, props.children)
  }
```

The `groupChildren` function, as the one before it, receives the _blueprint_ and the actual children on which to iterate

###### countChildren.js (partial)

```js
import React from 'react'
import getBlankInstance from './getBlankInstance'

const groupChildren = (blueprint, children) => {
  const groups = getBlankInstance(blueprint, [])

  console.log(groups)
}

export default groupChildren
```

First, it generates an object with the same structure as the _blueprint_. Different from the usage in the previous post, I pass a second argument - an empty array

In case the _blueprint_ was

###### config.js

```js
export const blueprint = {
  Header: 1,
  Image: 0,
  Description: 1,
  Footer: 1,
}
```

I'll get that `group` matches an object of the type

###### console.log(group)

```js
{
    Header: [],
    Image: [],
    Description: [],
    Footer: []
}
```

So I can iterate through the children and put each in the appropriate array

###### countChildren.js (partial)

```js
import React from 'react'
import getBlankInstance from './getBlankInstance'

const groupChildren = (blueprint, children) => {
  const groups = getBlankInstance(blueprint, [])

  React.Children.forEach(children, child => {
    const { name } = child.type

    groups[name] = [...groups[name], child]
  })

  return groups
}

export default groupChildren
```

Each sub-component is identified and taking advantage of the close correspondence between the sub-component names and the properties in `groups`, it's easy to put them in the right place

> As in the previous post, for the purposes of this post I am assuming that all direct children of Card are a sub-component of it and never any other _HTML tag_. This is certainly a limitation, but can be easily circumvented by means of another design pattern, the **Context API**

<center> ~ <b>Summing up</b> ~ </center>

Using the Card component & children as follows

###### App.js (detail)

```html
<Card>
  <Card.Header>Never talking</Card.Header>
  <Card.Description>Just keeps walking</Card.Description>
  <Card.Footer>Spreading his magic</Card.Footer>
</Card>
```

I get it as a product of `groupChildren`

###### groupChildren() output (streamlined)

```js
{
    Header: [
        0: {
            $$typeof: Symbol(react.element),
            props: { children: "Never talking" }
            type: {
                name: "Header"
            }
        }
    ],
    Image: [],
    Description: [{...}],
    Footer: [{...}]
}
```

---

#### Interlude III

To check if it is actually possible to exploit the sub-components thus organized I do a test

###### Card.js (constructor detail)

```jsx
const groups = groupChildren(blueprint, props.children)

this.groups = groups
```

And in rendering I replace `{this.props.children}` with

###### Card.js (render detail)

```jsx
render() {
    return <article className='card'>{this.groups.Header[0]}</article>
  }
```

And actually only the Header sub-component and its contents appear on the card. I can stuff it inside an indefinite number of HTML tags; I can also duplicate it at will - It appears where I tell it.

> I can therefore position with a high degree of precision where any child will have to be rendered.

However this is not the approach I want to use as for each sub-component there are several things to keep in mind

- Was it used or not?
- In case of two headers granted and provided, what do I do with the second? And of a possible third party?
- What if the next day I want to generate different types of layouts by passing a prop to Card - i.e. `<Card layout="minimal" />`?

Too many eventualities that will only grow with the complexity of the _blueprint_. Too much potential chaos. I need something to take care of it - **Builders** (in the next post)

---

Thanks for reading, see you soon with the next chapters

Repo that I update as I write this series of posts:
[repo](https://github.com/didof/react-assemblable-card)

If you like it, let's get in touch
[GitHub](https://github.com/didof/)
[Twitter](https://twitter.com/did0f)
[Linkedin](https://www.linkedin.com/in/francesco-di-donato-2a9836183/)
