/**
 * Sets the dark class before the first paint, so there is no flash (docs/design-system.md).
 * Light is the default, even if the system is dark; only an explicit choice switches.
 * `?theme=dark|light` in the URL sets and stores the choice (handy for checks).
 */
const script = `(function(){document.documentElement.classList.add('js');try{var q=new URLSearchParams(location.search).get('theme');if(q==='dark'||q==='light'){localStorage.setItem('sgbr-theme',q)}if(localStorage.getItem('sgbr-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
