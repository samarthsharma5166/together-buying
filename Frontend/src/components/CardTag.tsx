import { ShieldCheck, Rocket, Hammer, Key } from "lucide-react"

type dealLabelSchema = {
    dealLabel: "PRE_LAUNCH" | "UNDER_CONSTRUCTION" | "READY_TO_MOVE" | null
}


const CardTag = ({
    dealLabel
}: dealLabelSchema) => {
    if (!dealLabel) return null;

    const badgeConfig = function (dealLabel:string) {
        switch (dealLabel) {
            case "PRE_LAUNCH":
                return {
                    gradient: "from-emerald-600 to-emerald-400",
                    shadow: "shadow-emerald-900/50",
                    Icon: Rocket
                };
            case "UNDER_CONSTRUCTION":
                return {
                    gradient: "from-amber-600 to-amber-400",
                    shadow: "shadow-amber-900/50",
                    Icon: Hammer
                };
            case "READY_TO_MOVE":
                return {
                    gradient: "from-blue-600 to-indigo-500",
                    shadow: "shadow-blue-900/50",
                    Icon: Key
                };
            default:
                return {
                    gradient: "from-slate-600 to-slate-500",
                    shadow: "shadow-slate-900/50",
                    Icon: ShieldCheck
                };
        }
    }
    
    const label = dealLabel?.replace(/_/g, ' ');
    const { gradient, shadow, Icon } = badgeConfig(dealLabel);
    
    return (
        <div className="absolute left-0 top-4 z-10 drop-shadow-md">
            <div 
                className={`flex items-center gap-1.5 py-1.5 pl-3.5 pr-6 text-[10.5px] font-black uppercase tracking-wider text-white shadow-lg ${shadow} bg-gradient-to-r ${gradient}`}
                style={{ clipPath: "polygon(0 0, 100% 0, 90% 50%, 100% 100%, 0 100%)" }}
            >
                <Icon size={14} className="shrink-0 text-white/95" strokeWidth={2.5} />
                {label}
            </div>
        </div>
    )
}

export default CardTag