import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProjectCard = ({ project }) => {
  return (
    <div className="mb-16 flex flex-col gap-6 md:flex-row">
      <div className="relative w-full h-[300px] overflow-hidden rounded-lg border bg-background shadow-sm md:w-2/5">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover"
          sizes="100vw, 40vw"
        />
      </div>
      <div className="flex w-full flex-col justify-between md:w-3/5">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-600">{project.title}</h2>
          <p className="text-md text-gray-600">{project.description}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          {project.liveUrl && (
            <Link
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="island" className="flex items-center gap-2">
                <ExternalLink size={16} />
                Live Link
              </Button>
            </Link>
          )}

          {project.githubUrl && (
            <Link
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="flex items-center gap-2 text-black"
              >
                <Github size={16} className="text-black" />
                GitHub
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
