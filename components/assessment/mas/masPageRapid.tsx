import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFormikContext } from "formik";

export default function MasPageRapid({ currentPage }: { currentPage: number }) {
    const { values, setFieldValue } = useFormikContext<any>();

    if (currentPage !== 1) return null;

    return (
        <Card className="glass-panel">
            <CardHeader>
                <CardTitle className="text-foreground">MAS Rapid Risk Screening</CardTitle>
                <CardDescription className="text-muted-foreground">
                    Essential MAS technical and operational risk indicators.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Governance */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800">Governance & Accountability</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-slate-700">Documented Governance</Label>
                            <p className="text-xs text-slate-500">Does a formal governance framework exist for this AI system?</p>
                        </div>
                        <Switch
                            checked={values.governance_policy}
                            onCheckedChange={(v) => setFieldValue("governance_policy", v)}
                        />
                    </div>
                </div>

                {/* Risk Classification */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800">Risk Portfolio</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-slate-700">Critical Risk Category</Label>
                            <p className="text-xs text-slate-500">Is the system classified as high-risk under MAS criteria?</p>
                        </div>
                        <Switch
                            checked={values.inventory_recorded}
                            onCheckedChange={(v) => setFieldValue("inventory_recorded", v)}
                        />
                    </div>
                </div>

                {/* Operational */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800">Operational Controls</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-slate-700">Human Oversight</Label>
                            <p className="text-xs text-slate-500">Is there active human monitoring of model outputs?</p>
                        </div>
                        <Switch
                            checked={values.human_oversight}
                            onCheckedChange={(v) => setFieldValue("human_oversight", v)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Risk Mitigation Strategy</Label>
                    <Textarea
                        value={values.governance_framework}
                        onChange={(e) => setFieldValue("governance_framework", e.target.value)}
                        placeholder="Briefly describe the primary measures used to control AI risks..."
                        className="rounded-xl min-h-[100px] border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
