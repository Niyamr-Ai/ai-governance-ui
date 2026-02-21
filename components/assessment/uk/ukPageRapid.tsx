import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useFormikContext } from "formik";

export default function UkPageRapid({ currentPage }: { currentPage: number }) {
    const { values, setFieldValue, errors, touched } = useFormikContext<any>();

    if (currentPage !== 1) return null;

    return (
        <Card className="glass-panel">
            <CardHeader>
                <CardTitle className="text-foreground">Rapid Risk Screening</CardTitle>
                <CardDescription className="text-muted-foreground">
                    High-signal questions to determine your regulatory profile.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Critical Decision Impact */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800">Critical Impacts</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-slate-700">High-Impact Decisions</Label>
                            <p className="text-xs text-slate-500">Does this system make decisions affecting finance, health, employment, or safety?</p>
                        </div>
                        <Switch
                            checked={values.robustness_testing}
                            onCheckedChange={(v) => setFieldValue("robustness_testing", v)}
                        />
                    </div>
                </div>

                {/* Data Usage */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800">Data Governance</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-slate-700">Personal or Sensitive Data</Label>
                            <p className="text-xs text-slate-500">Does the system process personal or special category data?</p>
                        </div>
                        <Switch
                            checked={values.personal_data_handling}
                            onCheckedChange={(v) => setFieldValue("personal_data_handling", v)}
                        />
                    </div>
                </div>

                {/* Governance */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-800">Governance & Oversight</h3>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="space-y-0.5">
                            <Label className="text-slate-700">Human Oversight</Label>
                            <p className="text-xs text-slate-500">Are there existing human-in-the-loop or monitoring processes?</p>
                        </div>
                        <Switch
                            checked={values.human_oversight}
                            onCheckedChange={(v) => setFieldValue("human_oversight", v)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-700">Primary Governance Measures</Label>
                    <Textarea
                        value={values.accountability_roles}
                        onChange={(e) => setFieldValue("accountability_roles", e.target.value)}
                        placeholder="Briefly describe who is responsible for this system..."
                        className="rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
