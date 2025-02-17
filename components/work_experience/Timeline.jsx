import { experiences } from "@/constants";

const Timeline = () => {
  return (
    <div className="space-y-4">
      {experiences.map((exp, index) => (
        <div key={index} className="border-l-2 border-primary pl-4 pb-4">
          <h3 className="font-bold text-black dark:text-white">{exp.title}</h3>
          <p className="text-sm text-muted-foreground">
            {exp.company} | {exp.period}
          </p>
          <p className="mt-2 text-muted-foreground">{exp.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {exp.technologies.map((tech) => (
              <span
                key={tech}
                className="text-xs px-2 py-1 bg-primary/10 rounded-full text-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
