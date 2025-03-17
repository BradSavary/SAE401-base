import Card from "./Card";

interface Employee {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

interface TeamProps {
  title: string;
  heading: string;
  description: string;
  employees: Employee[];
}

export default function Team({ title, heading, description, employees }: TeamProps) {
  const employeeList = employees.map((employee) => (
    <li key={employee.id}>
      <Card
        image={employee.image}
        title={employee.title}
        subtitle={employee.subtitle}
      />
    </li>
  ));

  return (
    <section className="text-foreground m-auto max-w-6xl p-4 text-center">
      <header>
        <h2>{title}</h2>
        <h1 className="mt-3 text-4xl font-bold">{heading}</h1>
      </header>
      <div>
        <p className="max-w-ch text-foreground mx-auto mb-8 mt-4 leading-8 text-opacity-70">
          {description}
        </p>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
          {employeeList}
        </ul>
      </div>
    </section>
  );
}