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
                    <h3 className="text-lg font-medium">Critical Impacts</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="space-y-0.5">
                            <Label>High-Impact Decisions</Label>
                            <p className="text-xs text-muted-foreground">Does this system make decisions affecting finance, health, employment, or safety?</p>
                        </div>
                        <Switch
                            checked={values.robustness_testing} // Using existing field for proxy or mapping
                            onCheckedChange={(v) => setFieldValue("robustness_testing", v)}
                        />
                    </div>
                </div>

                {/* Data Usage */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Governance</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="space-y-0.5">
                            <Label>Personal or Sensitive Data</Label>
                            <p className="text-xs text-muted-foreground">Does the system process personal or special category data?</p>
                        </div>
                        <Switch
                            checked={values.personal_data_handling}
                            onCheckedChange={(v) => setFieldValue("personal_data_handling", v)}
                        />
                    </div>
                </div>

                {/* Governance */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Governance & Oversight</h3>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="space-y-0.5">
                            <Label>Human Oversight</Label>
                            <p className="text-xs text-muted-foreground">Are there existing human-in-the-loop or monitoring processes?</p>
                        </div>
                        <Switch
                            checked={values.human_oversight}
                            onCheckedChange={(v) => setFieldValue("human_oversight", v)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Primary Governance Measures</Label>
                    <Textarea
                        value={values.accountability_roles}
                        onChange={(e) => setFieldValue("accountability_roles", e.target.value)}
                        placeholder="Briefly describe who is responsible for this system..."
                        className="rounded-xl"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
