import { defineConfig, presetUno, presetWebFonts, presetAttributify, transformerDirectives } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      provider: 'bunny',
      fonts: {
        sans: 'Inter:300,400,500,600'
      }
    }),
    presetAttributify()
  ],
  transformers: [
    transformerDirectives()
  ],
  theme: {
    colors: {
      body: '#111b21',
      light: '#e9edef',
    }
  },
  shortcuts: {
    btn: 'rounded px-5 py-2 cursor-pointer border-width-1 no-underline text-sm',
    'btn-no-border': 'px-5 py-2 cursor-pointer border-width-0 no-underline text-sm',
    'btn-green': 'bg-green-700 text-slate-100 border-green-500 hover:bg-green-800'
  },
  preflights: [
    {
      getCSS: ({theme}) => `
        * {
          box-sizing: border-box;
        }
        html {
          font-size: 16px;
        }
        body {
          margin:0;
          padding:0;
        }
        a,
        a:visited,
        a:active {
          color: ${theme.colors.light};
          text-decoration: underline;
        }
        a:hover {
          color: ${theme.colors.light};
          text-decoration: none;
        }
        h1,h2,h3,h4 {
          font-weight: 600;
        }
        h1 {
          font-size: 1.75rem;
        }
        h2 {
          font-size: 1.5rem;
        }
        h3 {
          font-size: 1.25rem;
        }
        h4 {
          font-size: 1rem;
        }
        p:not(:last-child){
          margin-bottom: 1rem;
        }
        .fade-enter-active,
        .fade-leave-active {
          transition: opacity 0.5s ease;
        }

        .fade-enter-from,
        .fade-leave-to {
          opacity: 0;
        }
      `,
    }
  ]
})