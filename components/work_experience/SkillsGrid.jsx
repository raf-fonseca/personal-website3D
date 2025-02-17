import Image from "next/image";
import { skills } from "@/constants";

const SkillsGrid = () => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {skills.map((skill) => (
        <div
          key={skill.name}
          className="p-3 bg-white/50 rounded-lg hover:scale-105 transition-transform w-24 h-28 flex flex-col border hover:shadow-lg transition-all duration-300"
        >
          <div className="flex-1 flex items-center justify-center mb-2">
            <div className="relative w-[40px] h-[40px]">
              <Image
                src={skill.imageUrl}
                alt={skill.name}
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
          </div>
          <h3 className="text-xs font-semibold text-black dark:text-white text-center border-t border-gray-200 dark:border-gray-700 pt-2">
            {skill.name}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default SkillsGrid;
