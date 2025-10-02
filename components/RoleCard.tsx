import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface Permission {
  label: string;
  checked: boolean;
}

interface PermissionSection {
  title: string;
  permissions: Permission[];
}

interface RoleCardProps {
  title: string;
  description: string;
  sections: PermissionSection[];
}

export default function RoleCard({
  title,
  description,
  sections,
}: RoleCardProps) {
  return (
    <div className="w-full bg-white rounded shadow-sm border border-transparent p-4 sm:p-6 flex flex-col h-full">
      <h3 className="text-[#003366] text-base sm:text-lg font-normal leading-7 tracking-[-0.45px] mb-2.5">
        {title}
      </h3>
      <p className="text-[#565D6D] text-sm font-normal leading-5 mb-4 sm:mb-6">
        {description}
      </p>

      <div className="flex flex-col gap-0">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="pt-0.5 pb-1.5 border-b border-[#DEE1E6] mb-2.5">
              <h4 className="text-[#171A1F] text-base font-bold leading-6 font-montserrat">
                {section.title}
              </h4>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              {section.permissions.map((permission, permIndex) => (
                <div
                  key={permIndex}
                  className="flex items-center gap-2 pl-2"
                >
                  <Checkbox
                    checked={permission.checked}
                    className={cn(
                      "h-4 w-4 rounded-sm",
                      permission.checked
                        ? "bg-[#003366] border-[#003366] data-[state=checked]:bg-[#003366] data-[state=checked]:border-[#003366]"
                        : "border-[#565D6D] bg-white"
                    )}
                  />
                  <label className="text-[#171A1F] text-sm font-normal leading-[22px] cursor-pointer">
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}