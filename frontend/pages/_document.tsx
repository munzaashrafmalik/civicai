import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <meta name="theme-color" content="#2563eb" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var l=localStorage.getItem('civicai_lang');if(l){document.documentElement.lang=l;document.documentElement.dir=l==='ur'?'rtl':'ltr'}}catch(e){}})()`,
          }}
        />
      </Head>
      <body className="min-h-screen bg-neutral-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
