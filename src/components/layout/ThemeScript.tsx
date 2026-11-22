/**
 * Sets the dark class before the first paint, so there is no flash (docs/design-system.md).
 * Light is the default, even if the system is dark; only an explicit choice switches.
 */
const script = `(function(){try{if(localStorage.getItem('sgbr-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
