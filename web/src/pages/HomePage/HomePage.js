import { Link, routes } from '@redwoodjs/router'

const HomePage = () => {
  return (
    <main>
      <section>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            html, body {
              margin: 0;
            }
            html * {
              box-sizing: border-box;
            }
            main {
              display: flex;
              align-items: center;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
              text-align: center;
              background-color: #E2E8F0;
              height: 100vh;
            }
            section {
              width: 32rem;
              padding: 1rem;
              margin: 0 auto;
            }
            div.logo {
              color: #bf4722;
            }
            h1 {
              font-size: 1.65rem;
              margin: 0;
              font-weight: 600;
              line-height: 1;
            }
            h1 span {
              color: #1A202C;
            }
            div.code {
              background-color: #1A202C;
              color: #718096;
              border: 1px solid black;
              border-radius: 4px;
              padding: 0.5rem;
              text-align: left;
              margin-top: 1.5rem;
            }
            p {
              font-size: 1.25rem;
              font-weight: 300;
            }
            code {
              font-family: 'Fira Code', 'Fira Mono', Menlo, Monaco, monospace;
              font-size: 0.9rem
            }
            code div {
              margin: 2px 0;
            }
            code span {
              color: white;
            }
            svg {
              fill: currentColor;
              margin: 0 auto;
              width: 6rem;
            }
            @media (max-width: 640px) {
              section {
                width: 100%;
              }
              h1 {
                font-size: 2rem;
              }
              p {
                font-size: 1.2rem;
                line-height: 1.4
              }
              code {
                font-size: 0.65rem;
              }
            }
          `,
          }}
        />
        <div>
          <div className="logo">
            <svg viewBox="0 0 100 108" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M44.0242238,2.5035461 C40.040373,4.50827423 31.6423673,8.41127236 27.092858,11.5248227 C22.5433486,14.638373 23.1090072,17.5390071 21.1170818,19.5437352 C19.1251564,21.5484634 13.1493802,26.5602837 9.16552946,29.5673759 C5.18167867,32.5744681 6.17764137,40.5933806 5.18167867,43.6004728 C4.18571598,46.607565 2.19379058,53.6241135 1.19782789,56.6312057 C0.20186519,59.6382979 3.18975328,63.6477541 5.18167867,67.6572104 C7.17360406,71.6666667 12.1534175,82.6926714 14.1453429,86.7021277 C16.1372683,90.7115839 22.1130445,88.7068558 27.092858,92.7163121 C32.0726715,96.7257683 39.0444103,101.737589 44.0242238,104.744681 C49.0040373,107.751773 50.9959627,107.751773 55.9757762,104.744681 C60.9555897,101.737589 67.9273285,96.7257683 72.907142,92.7163121 C77.8869555,88.7068558 83.8627317,90.7115839 85.8546571,86.7021277 C87.8465825,82.6926714 92.8263959,71.6666667 94.8183213,67.6572104 C96.8102467,63.6477541 99.7981348,59.6382979 98.8021721,56.6312057 C97.8062094,53.6241135 95.814284,46.607565 94.8183213,43.6004728 C93.8223586,40.5933806 94.8183213,32.5744681 90.8344705,29.5673759 C86.8506198,26.5602837 82.2262414,22.7314517 78.8829182,19.5437352 C75.539595,16.3560187 76.8909928,14.5319149 72.907142,11.5248227 C68.9232912,8.5177305 59.959627,4.50827423 55.9757762,2.5035461 C51.9919254,0.498817967 48.0080746,0.498817967 44.0242238,2.5035461 Z"
                fill="#FFFFFF"
              />
              <path
                d="M29.9574422,19.8798299 L48.5979308,32.6036777 C49.0186415,32.8838873 49.5100535,33.0372994 50.0143813,33.0458742 C50.5194777,33.0422108 51.0122458,32.8883753 51.4308318,32.6036777 L70.0854849,19.8370367 C70.8103086,19.3180579 71.2100127,18.4529047 71.1373586,17.5602728 C71.0647045,16.6676408 70.5304402,15.8795823 69.7313722,15.4863937 L51.0908837,6.25732469 C50.3837854,5.9142251 49.5599901,5.9142251 48.8528919,6.25732469 L30.2690613,15.4863937 C29.4556159,15.8816899 28.9142774,16.6849786 28.849927,17.5922379 C28.7855766,18.4994972 29.2080458,19.3721147 29.9574422,19.8798299 L29.9574422,19.8798299 Z M56.345915,36.5977106 C56.3473611,37.4414918 56.7603824,38.2307002 57.4507464,38.7088423 L72.3942992,48.9221551 C73.3509208,49.5817308 74.630889,49.4993293 75.4963258,48.7224535 L88.0319127,37.5106324 C88.5905956,37.0115176 88.9008034,36.2886546 88.8789275,35.5368734 C88.8570516,34.7850921 88.5053432,34.0817628 87.9185967,33.6164503 L75.9495899,24.0450357 C75.0796085,23.3538894 73.8659451,23.3077678 72.9467149,23.9309204 L57.4507464,34.5293721 C56.772588,34.9988534 56.3611472,35.7691057 56.345915,36.5977106 Z M20.0139597,52.6451644 C20.0927109,51.8340196 19.7822122,51.0337489 19.1782539,50.4912395 L13.5124519,45.4559051 C12.8788092,44.8699156 11.9876097,44.6590608 11.161144,44.8995934 C10.3340578,45.125971 9.67781293,45.7599795 9.41890992,46.582793 L6.11858026,56.9672786 C5.80082317,57.9771206 6.13525194,59.0796714 6.95910492,59.7383355 C7.7829579,60.3969996 8.92510534,60.47496 9.82968057,59.9342745 L18.7533187,54.5851233 C19.4643214,54.1861237 19.9355071,53.4610316 20.0139597,52.6451644 L20.0139597,52.6451644 Z M67.5783675,51.5753341 L51.4449963,40.5346859 C50.5875842,39.957763 49.4695074,39.957763 48.6120953,40.5346859 L32.4787241,51.5753341 C31.8370255,52.019478 31.4305323,52.7332341 31.3738927,53.515293 C31.332097,54.3028224 31.6441619,55.0675361 32.223763,55.5978959 L48.3429697,70.0192077 C48.8078185,70.4338176 49.4075906,70.6622218 50.0285458,70.6611099 C50.6492618,70.6611099 51.2485848,70.4326684 51.7141219,70.0192077 L67.8333286,55.5978959 C68.4146448,55.0697366 68.7227655,54.3018909 68.6690344,53.515293 C68.6240007,52.7332664 68.2210746,52.0165855 67.5783675,51.5753341 L67.5783675,51.5753341 Z M12.0251788,37.5106324 L24.5466013,48.7224535 C25.4186406,49.4966981 26.7003319,49.5788355 27.6627924,48.9221551 L42.5921806,38.7088423 C43.3107031,38.2376499 43.7440659,37.4326659 43.7440659,36.5691818 C43.7440659,35.7056977 43.3107031,34.9007137 42.5921806,34.4295213 L27.1103767,23.8310696 C26.1854551,23.2100411 24.9693948,23.2560369 24.0933371,23.9451848 L12.1243304,33.5736571 C11.5372776,34.0397872 11.1889337,34.7466243 11.1753085,35.4993516 C11.1508813,36.2630614 11.4617797,36.9988256 12.0251788,37.5106324 Z M88.8392895,64.8269649 L76.091235,57.1955091 C75.1445326,56.6249611 73.9394273,56.7405425 73.1166889,57.4807971 L57.5357334,71.3885904 C56.878522,71.9755693 56.5698412,72.8633086 56.7198676,73.7349499 C56.869894,74.6065912 57.4572483,75.3379224 58.2722877,75.6679114 L79.8873223,84.4262551 C80.1837846,84.549429 80.5014783,84.6124464 80.8221797,84.611705 C81.8253501,84.6148616 82.7360472,84.0220889 83.1451585,83.0996656 L89.8449693,68.0935132 C90.3902966,66.9060009 89.9560495,65.4955232 88.8392895,64.8269649 Z M93.9101823,56.9672786 L90.6098526,46.582793 C90.3481953,45.7587495 89.6940914,45.1214541 88.8676185,44.885329 C88.0408564,44.658751 87.1563892,44.868013 86.5163107,45.4416407 L80.8505087,50.4912395 C80.242623,51.0309911 79.9313081,51.8333655 80.0148029,52.6451644 C80.0817214,53.4534087 80.536548,54.1777422 81.2329503,54.5851233 L90.170753,59.9342745 C90.5601622,60.169095 91.0058415,60.2923979 91.4597229,60.2908984 C92.2687343,60.2924304 93.0299087,59.9050863 93.5085722,59.2482724 C93.9872357,58.5914585 94.1259145,57.7440394 93.8818533,56.9672786 L93.9101823,56.9672786 Z M43.3287349,73.7279526 C43.481104,72.8598939 43.1754845,71.9743658 42.5213581,71.3885904 L26.9404026,57.4807971 C26.1176642,56.7405425 24.912559,56.6249611 23.9658566,57.1955091 L11.2178021,64.8269649 C10.1140233,65.4984817 9.67731662,66.8911394 10.1979577,68.0792488 L16.9119331,83.0854012 C17.4681577,84.3366402 18.9062779,84.9222421 20.1697692,84.4119907 L41.7706394,75.653647 C42.5859475,75.3265703 43.1753174,74.5981513 43.3287349,73.7279526 L43.3287349,73.7279526 Z M68.3149217,85.02536 L50.9775676,78.0072736 C50.3679103,77.7641852 49.6891813,77.7641852 49.0795239,78.0072736 L31.7421698,85.02536 C30.8781644,85.3793993 30.2714675,86.1758497 30.1557453,87.1079629 C30.0522982,88.0442922 30.4721626,88.9613296 31.2464121,89.4901183 L48.5837663,101.543539 C49.0007611,101.833289 49.493653,101.992127 50.0002168,102 C50.5072012,101.994731 51.0008309,101.835655 51.4166673,101.543539 L68.7681859,89.4901183 C69.5395899,88.9599618 69.9544406,88.0419529 69.8446883,87.1079629 C69.748265,86.185465 69.1626318,85.388192 68.3149217,85.02536 L68.3149217,85.02536 Z"
                fill="#BF4722"
              />
            </svg>
          </div>
          <h1>
            <span>Welcome to RedwoodJS on Kubernetes!</span>
          </h1>
        </div>
        <div>
          <p>
            Thanks for choosing Redwood Router! You&apos;re seeing this page
            because you don&apos;t have any custom routes yet. You can add a
            homepage route like so:
          </p>
          <div className="code">
            <code>
              <div>{`import { Router, Route } from '@redwoodjs/router'`}</div>
              <div>&nbsp;</div>
              <div>{`<Router>`}</div>
              <div>
                &nbsp;&nbsp;
                <span>{`<Route path="/" page={HomePage} name="home" />`}</span>
              </div>
              <div>&nbsp;&nbsp;{`<Route notfound page={NotFoundPage} />`}</div>
              <div>{`</Router>`}</div>
            </code>
          </div>
        </div>
      </section>
    </main>
  )
}

export default HomePage
