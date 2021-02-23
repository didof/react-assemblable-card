# Assemblable Card

Recap dal post precedente.

Al termine del primo post della serie ho costruito un componente Card che mediante il Compound Pattern è estendibile con una serie di sotto componenti.

Tuttavia l'ordine in cui vengono inseriti nell'instanziamento del componente è rilevante circa l'ordine secondo cui vengono renderizzati. Seppur trattandosi di un grado di libertà maggiore, è associato con diverse complicazioni circa lo stile ed eventuali funzionalità che andrò ad implementare nei sotto-componenti stessi.

Pertanto

L'obiettivo di questo post è ottenere che, a prescindere dall'ordine utilizzato nell'istanziamento della card, il posizionamento dei sotto componenti sia sempre il medesimo.

Raggiungerò tale obiettivo in due step:

- mappatura dei riferimenti relativi ad ogni sotto-componente utilizzato all'interno di un oggetto
- posizionamento di ogni sotto-componente alla propria posizione specifica all'interno dei confini della card

---

#### Chapter III - Another Brick in The Wall

Mediante un approccio simile a quello adottato per il censimento dei sotto-componenti (vedi post precedente), questa volta non mi limio a verificare che la struttura rispetti il blueprint - di ogni sotto-componente estrapolo e immagazzino il riferimento nell'apposita categoria in modo da poterlo riutilizzare a piacimento in un secondo momento.

Quindi procedo al raggruppamento dei children in un helper method.

```bash
touch src/utils/groupChildren.js
```

Come `registerChildren` si tratta di una funzione utilizzata nel costruttore di Card.

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

La funzione `groupChildren` riceve come quella che la precede il blueprint e gli effettivi children sui quali iterare.

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

Come prima cosa, genera un oggetto con la stessa struttura del _blueprint_. Differente dall'utilizzo nel post precedente, passo un secondo argomento - una array vuota. Nel caso in cui il blueprint fosse

###### config.js

```js
export const blueprint = {
  Header: 1,
  Image: 0,
  Description: 1,
  Footer: 1,
}
```

Otterrò che group corrisponde ad un oggetto del tipo

###### console.log(group)

```js
{
    Header: [],
    Image: [],
    Description: [],
    Footer: []
}
```

Perfetto. Posso dunque iterare per i figli e pushare ognuno nell'opportuna array.

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

Ogni sotto-componente viene identificato e sfruttando la stretta corrispondenza tra i nomi dei sotto-componenti e le proprietà in `groups`, è facile inserirli al posto giusto.

> Come nel post precedente, ai fini di questo post sto dando per assunto che tutti i children diretti di Card siano un suo sotto-componente e mai un qualsiasi altro HTML tag. Si tratta certo di una limitazione, facilmente raggirabile però mediante un altro design pattern, il Context API

Tiro le somme.

Utilizzando il componente & figli come segue

###### App.js (detail)

```html
<Card>
  <Card.Header>Never talking</Card.Header>
  <Card.Description>Just keeps walking</Card.Description>
  <Card.Footer>Spreading his magic</Card.Footer>
</Card>
```

Ottengo come prodotto di `groupChildren`

###### groupChildren output (snellito)

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

Per verificare se è effettivamente possibile sfruttare i sotto-componenti così organizzati faccio una prova

###### Card.js (constructor detail)

```jsx
const groups = groupChildren(blueprint, props.children)

this.groups = groups
```

E nel render sostituisco `{this.props.children}` con

###### Card.js (render detail)

```jsx
render() {
    return <article className='card'>{this.groups.Header[0]}</article>
  }
```

Ed effettivamente solo il sotto-component Header e il suo contenuto appaiono nella card. Posso dunque posizionare con un alto grado di precisione dove ogni eventuale figlio dovrà essere renderizzato.

Tuttavia non è questo l'approccio che voglio utilizzare in quanto per ogni sotto-componente ci sono diverse cose da tenere a mente

- è stato utilizzato?
- in caso di due header concessi e forniti, cosa ne faccio del secondo? E di un eventuale terzo?
- E se l'indomani volessi generare diversi tipi di layout passando una prop a Card - i.e. `<Card layout="minimal" />`?

Risposta: **Builders**

---

Thanks for reading, see you soon with the next chapters

Repo that I update as I write this series of posts:
[repo](https://github.com/didof/react-assemblable-card)

If you like it, let's get in touch
[GitHub](https://github.com/didof/)
[Twitter](https://twitter.com/did0f)
[Linkedin](https://www.linkedin.com/in/francesco-di-donato-2a9836183/)
