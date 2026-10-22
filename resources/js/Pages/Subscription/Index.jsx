import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Check, Crown, Zap, Shield, Star, X } from 'lucide-react';

export default function SubscriptionIndex({ plans = [], currentPlan = 'normal', userRole = 'cliente', company = null }) {
    const { auth } = usePage().props;

    const handleSubscribe = (planCode) => {
        router.post(route('subscriptions.upgrade'), { plan_type: planCode });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Suscripción y Planes" />

            <div className="mx-auto max-w-6xl space-y-8">
                <div className="text-center space-y-2">
                    <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase">Planes y Suscripción</span>
                    <h1 className="text-3xl font-black text-slate-900">Elige el plan ideal para <span className="text-blue-700">{userRole === 'admin' ? 'tu equipo' : 'ti'}</span></h1>
                    <p className="text-sm text-slate-500">
                        Rol actual: <span className="font-bold text-slate-700 uppercase">{userRole}</span>
                        {company && <span className="ml-2">· Empresa: <span className="font-bold text-slate-700">{company.name}</span></span>}
                    </p>
                    {currentPlan && (
                        <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Plan actual:</span>
                            <span className="text-xs font-black uppercase text-blue-600">
                                {currentPlan}
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrent = currentPlan === plan.code;
                        return (
                            <div key={plan.id} className={`bg-white rounded-2xl border ${isCurrent ? 'border-2 border-blue-600 shadow-xl' : 'border-slate-200 shadow-sm'} p-6 space-y-6 flex flex-col justify-between`}>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            <Crown className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                                            {plan.code}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                                        <p className="text-xl font-black text-blue-600 mt-1">{plan.price}</p>
                                    </div>

                                    <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                                        <li>👥 Máx. Usuarios: <span className="font-bold text-slate-900">{plan.max_users}</span></li>
                                        <li>🏪 Sucursales: <span className="font-bold text-slate-900">{plan.max_branches}</span></li>
                                        <li>⏳ Vigencia: <span className="font-bold text-slate-900">1 Año (Renovable)</span></li>
                                    </ul>

                                    <ul className="space-y-2.5 pt-2 border-t border-slate-100">
                                        {Array.isArray(plan.benefits) && plan.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                <span className="text-xs text-slate-700">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-4 border-t border-slate-100">
                                    {isCurrent ? (
                                        <div className="w-full py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-center text-xs font-black text-blue-700 uppercase tracking-wider">
                                            PLAN ACTUAL
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribe(plan.code)}
                                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm"
                                        >
                                            Cambiar a {plan.name}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
