import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, X, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type OptionType = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  badgeClassName?: string;
  emptyText?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Seleccionar...",
  className,
  badgeClassName,
  emptyText = "No hay opciones disponibles",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const handleSelect = (value: string) => {
    // Si ya está seleccionado, lo quitamos, sino lo añadimos
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  // Para mostrar etiquetas de los seleccionados
  const selectedLabels = selected.map(
    (value) => options.find((option) => option.value === value)?.label || value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex flex-wrap gap-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className={cn("mr-1", badgeClassName)}
                >
                  {label}
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-1 rounded-full outline-none ring-offset-background cursor-pointer hover:text-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnselect(
                        options.find((option) => option.label === label)
                          ?.value || ""
                      );
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(
                          options.find((option) => option.label === label)
                            ?.value || ""
                        );
                      }
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar..." className="h-9" />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", 
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50")}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
