"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} asChild {...props}>
    <motion.div
      className={cn(
        "fixed inset-0 z-50 bg-void/80 backdrop-blur-sm",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  </DialogPrimitive.Overlay>
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} asChild {...props}>
      <motion.div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2",
          "bg-surface border border-border rounded-[var(--radius-card)] shadow-card p-6",
          "focus:outline-none",
          className
        )}
        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-50%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm text-muted opacity-70 transition-opacity hover:opacity-100 hover:text-ink focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-surface disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </motion.div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-ink",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted mt-1.5", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
