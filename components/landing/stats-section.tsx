export function StatsSection() {
  return (
    <section className="border-y bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary">99.9%</h3>
            <p className="text-sm text-muted-foreground font-medium">Uptime Guarantee</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary">50k+</h3>
            <p className="text-sm text-muted-foreground font-medium">Products Tracked</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary">10+</h3>
            <p className="text-sm text-muted-foreground font-medium">Countries Supported</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-primary">24/7</h3>
            <p className="text-sm text-muted-foreground font-medium">Expert Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
