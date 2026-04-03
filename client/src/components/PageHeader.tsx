/*
 * DESIGN: "Warm Authority" — Navy header with gold accent line, Playfair Display title
 */
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  imageSrc?: string;
}

export default function PageHeader({ title, subtitle, imageSrc }: PageHeaderProps) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: imageSrc
          ? `linear-gradient(to bottom, rgba(27,58,107,0.75) 0%, rgba(27,58,107,0.55) 100%), url(${imageSrc}) center/cover no-repeat`
          : "linear-gradient(135deg, #1B3A6B 0%, #2A5298 100%)",
        minHeight: imageSrc ? "180px" : "auto",
      }}
    >
      <div className="px-4 pt-10 pb-6">
        <div className="w-10 h-1 rounded-full mb-3" style={{ background: "#C9922A" }} />
        <h1
          className="text-2xl font-bold text-white leading-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-blue-100 text-sm leading-relaxed" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
