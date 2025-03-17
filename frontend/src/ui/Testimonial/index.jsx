import SingleTestimony from "./SingleTestimony";



export default function Testimonial({data}) {

    let testimonies = data.map((testimony, index) => {
        return (
            <SingleTestimony key={index} {...testimony} />
        );
    });

    return (
        <div className="container my-24 mx-auto md:px-6">
            <section className="mb-32 text-center">
                <h2 className="mb-12 text-3xl font-bold">Ils ont eu affaire à eux !</h2>

                <div className="grid gap-x-6 md:grid-cols-3 lg:gap-x-12">
                    {testimonies}
                </div>
            </section>
        </div>
  
    );
}