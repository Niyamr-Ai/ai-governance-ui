"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/utils/shared-utils";

interface AssessmentCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function AssessmentCard({
  children,
  title,
  description,
  icon,
  badge,
  className,
  headerClassName,
  contentClassName,
}: AssessmentCardProps) {
  return (
    <Card
      className={cn(
        "glass-panel shadow-premium border-border/50 rounded-2xl overflow-hidden",
        "transition-all duration-300 ease-out",
        className
      )}
    >
      {(title || description) && (
        <CardHeader className={cn("pb-4", headerClassName)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {title}
                  </CardTitle>
                )}
                {description && (
                  <CardDescription className="text-sm text-muted-foreground mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            {badge && <div>{badge}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("pt-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
