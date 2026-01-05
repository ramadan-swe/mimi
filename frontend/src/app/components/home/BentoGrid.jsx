import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Sparkles, MessageSquare } from 'lucide-react';
import { PREBAKED_INTENTS, buildExploreUrl } from '../../../lib/prebaked-intents';
function BentoCard({ title, description, icon, gradient, onClick, size = 'normal' }) {
    return (<Card onClick={onClick} className={`
        ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
        relative overflow-hidden cursor-pointer group
        hover:shadow-xl transition-all duration-300 hover:-translate-y-1
        bg-gradient-to-br ${gradient} text-white
        p-6 flex flex-col justify-between min-h-[200px]
      `}>
            <div className="relative z-10">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="text-white/90 text-sm">{description}</p>
            </div>
            <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <Sparkles className="h-16 w-16"/>
            </div>
        </Card>);
}
export default function BentoGrid() {
    const navigate = useNavigate();
    const handleIntentClick = (getParams) => {
        const params = getParams();
        const url = buildExploreUrl(params);
        navigate(url);
    };
    const handleMimiAssistantClick = () => {
        navigate('/explore?ai_enabled=true');
    };
    return (<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Discover Your Perfect Ride
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Choose a curated journey or let our AI assistant find exactly what you need
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Sahel Summer */}
                <BentoCard id={PREBAKED_INTENTS.sahelSummer.id} title={PREBAKED_INTENTS.sahelSummer.title} description={PREBAKED_INTENTS.sahelSummer.description} icon={PREBAKED_INTENTS.sahelSummer.icon} gradient={PREBAKED_INTENTS.sahelSummer.gradient} onClick={() => handleIntentClick(PREBAKED_INTENTS.sahelSummer.getParams)}/>

                {/* Cairo Commuter */}
                <BentoCard id={PREBAKED_INTENTS.cairoCommuter.id} title={PREBAKED_INTENTS.cairoCommuter.title} description={PREBAKED_INTENTS.cairoCommuter.description} icon={PREBAKED_INTENTS.cairoCommuter.icon} gradient={PREBAKED_INTENTS.cairoCommuter.gradient} onClick={() => handleIntentClick(PREBAKED_INTENTS.cairoCommuter.getParams)}/>

                {/* Elite Selection */}
                <BentoCard id={PREBAKED_INTENTS.eliteSelection.id} title={PREBAKED_INTENTS.eliteSelection.title} description={PREBAKED_INTENTS.eliteSelection.description} icon={PREBAKED_INTENTS.eliteSelection.icon} gradient={PREBAKED_INTENTS.eliteSelection.gradient} onClick={() => handleIntentClick(PREBAKED_INTENTS.eliteSelection.getParams)}/>

                {/* Mimi Assistant - Large Card */}
                <Card onClick={handleMimiAssistantClick} className="md:col-span-3 relative overflow-hidden cursor-pointer group
            hover:shadow-xl transition-all duration-300 hover:-translate-y-1
            bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 text-white
            p-8 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[180px]">
                    <div className="relative z-10 flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            <MessageSquare className="h-8 w-8"/>
                            <h3 className="text-3xl font-bold">Mimi Assistant</h3>
                        </div>
                        <p className="text-white/90 text-base mb-2">
                            Describe your needs in natural language
                        </p>
                        <p className="text-white/75 text-sm italic">
                            Try: &quot;I need a luxury SUV in Cairo for a week with GPS&quot;
                        </p>
                    </div>
                    <div className="relative z-10">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 group-hover:bg-white/30 transition-colors">
                            <Sparkles className="h-12 w-12"/>
                        </div>
                    </div>
                </Card>
            </div>
        </div>);
}
