
import Plan from "./Plan.jsx";


export default function Pricing({title="No title", description="No description", plans=[]}) {
    
    let handler = (label) => {
        console.log("Ordering", label);
    }

    return (
        <div className="container my-24 mx-auto md:px-6">
            <section className="mb-32">
                <h2 className="mb-12 text-center text-3xl font-bold">Pricing</h2>

                <div className="grid gap-6 lg:grid-cols-3 lg:gap-x-12">
                
                    {plans.map((plan, index) => (
                        <Plan 
                            key={index} 
                            label={plan.name} 
                            price={plan.price}
                            advantages={plan.advantages}
                            onOrder={handler} />
                    ))}
                    
                </div>
            </section>
        </div>
    );
    return (
        <div className="offer">
        <div className="offer-section">
            <h2 className="offer-section__title">{title}</h2>
            <p className="offer-section__description">{description}</p>
           
            <div className="box">
                {plans.map((plan, index) => (
                    <Plan 
                        key={index} 
                        label={plan.name} 
                        price={plan.price}
                        advantages={plan.advantages}
                        onOrder={handler} />
                ))}
            </div>
        </div>
    </div>
    );
}
/*

<!-- Container for demo purpose -->
<div className="container my-24 mx-auto md:px-6">
  <!-- Section: Design Block -->
  <section className="mb-32">
    <h2 class="mb-12 text-center text-3xl font-bold">Pricing</h2>

    <div class="grid gap-6 lg:grid-cols-3 lg:gap-x-12">
*/