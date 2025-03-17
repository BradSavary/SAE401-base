

const svgcheckmark = (
    <svg style={{
        fill:"none",
        strokeWidth:"2",
        stroke:"currentColor"}} 
        viewBox="0 0 24 24" className="mr-3 h-5 w-5 text-primary dark:text-primary-400">
        <path style={{
            strokeLinecap:"round",
            strokeLinejoin:"round"}}
            d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

function Item({text, check}) {
    let checkmark = check ? svgcheckmark : "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
    return (
        <li className="mb-4 flex">
            <span>{checkmark}</span> 
            {text}
        </li>
    );
}

export default function Plan({label, price, advantages, onOrder=null}) {
   
    return (
        <div className="mb-6 lg:mb-0 text-white">
        <div
          className="block h-full rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700">
          <div className="border-b-2 border-neutral-100 border-opacity-100 p-6 text-center dark:border-opacity-10">
            <p className="mb-4 text-sm uppercase">
              <strong>{label}</strong>
            </p>
            <h3 className="mb-6 text-3xl">
              <strong>€ {price}</strong>
              <small className="text-base text-neutral-500 dark:text-neutral-300">/an</small>
            </h3>
           
            {onOrder && <button type="button"
              onClick={()=>{onOrder(label)}}
              className="inline-block w-full rounded bg-primary-100 px-6 pt-2.5 pb-2 text-xs font-medium uppercase leading-normal text-primary-700 transition duration-150 ease-in-out hover:bg-primary-accent-100 focus:bg-primary-accent-100 focus:outline-none focus:ring-0 active:bg-primary-accent-200"
              data-te-ripple-init data-te-ripple-color="light">
              Acheter
            </button>}
          </div>
          <div className="p-6">
            <ul>
                {advantages.map((item, index) => (
                    <Item key={index} text={item.text} check={item.check} />
                ))}
            </ul>
          </div>
        </div>
      </div>
    
    );
}

