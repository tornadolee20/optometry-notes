import { OptometryRecord } from '@/types';

interface Props {
  data: Partial<OptometryRecord>;
  onChange: (data: Partial<OptometryRecord>) => void;
}

const NumberInput = ({ label, value, onChange, placeholder, unit, step = 0.25 }: {
  label: string; value?: number; onChange: (v?: number) => void;
  placeholder?: string; unit?: string; step?: number;
}) => (
  <div className="flex-1 min-w-0">
    <label className="text-label text-muted-foreground block mb-1">{label}</label>
    <div className="relative">
      <input
        type="number"
        inputMode="decimal"
        step={step}
        value={value ?? ''}
        onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        placeholder={placeholder ?? '—'}
        className="w-full bg-card rounded-md shadow-card px-3 py-3.5 text-body text-card-foreground placeholder:text-muted-foreground touch-target"
      />
      {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-label text-muted-foreground">{unit}</span>}
    </div>
  </div>
);

const SelectInput = ({ label, value, onChange, options }: {
  label: string; value?: string; onChange: (v?: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="flex-1 min-w-0">
    <label className="text-label text-muted-foreground block mb-1">{label}</label>
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value || undefined)}
      className="w-full bg-card rounded-md shadow-card px-3 py-3.5 text-body text-card-foreground touch-target appearance-none"
    >
      <option value="">未選擇</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-body font-semibold text-foreground mt-6 mb-3 flex items-center gap-2">{children}</h3>
);

const EyeRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3">{children}</div>
);


const OptometryForm = ({ data, onChange }: Props) => {
  const set = <K extends keyof OptometryRecord>(key: K, val: OptometryRecord[K] | undefined) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="space-y-1">
      <p className="text-label text-muted-foreground mb-2">所有欄位皆為選填，可稍後補充</p>

      {/* Manifest Refraction */}
      <SectionTitle>👓 一般驗光</SectionTitle>
      <div className="space-y-3">
        <div className="text-label font-medium text-foreground">球面度數 (SPH)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.manifest_R_sphere} onChange={v => set('manifest_R_sphere', v)} placeholder="-2.75" unit="D" />
          <NumberInput label="左眼 L" value={data.manifest_L_sphere} onChange={v => set('manifest_L_sphere', v)} placeholder="-2.50" unit="D" />
        </EyeRow>
        <div className="text-label font-medium text-foreground">散光度數 (CYL)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.manifest_R_cylinder} onChange={v => set('manifest_R_cylinder', v)} placeholder="-0.75" unit="D" />
          <NumberInput label="左眼 L" value={data.manifest_L_cylinder} onChange={v => set('manifest_L_cylinder', v)} placeholder="-0.50" unit="D" />
        </EyeRow>
        <div className="text-label font-medium text-foreground">軸度 (AXIS)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.manifest_R_axis} onChange={v => set('manifest_R_axis', v)} placeholder="180" unit="°" step={1} />
          <NumberInput label="左眼 L" value={data.manifest_L_axis} onChange={v => set('manifest_L_axis', v)} placeholder="175" unit="°" step={1} />
        </EyeRow>
      </div>

      {/* Rx Prescription */}
      <SectionTitle>📋 配鏡處方</SectionTitle>
      <div className="space-y-3">
        <div className="text-label font-medium text-foreground">球面度數 (SPH)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.rx_R_sphere} onChange={v => set('rx_R_sphere', v)} placeholder="-2.50" unit="D" />
          <NumberInput label="左眼 L" value={data.rx_L_sphere} onChange={v => set('rx_L_sphere', v)} placeholder="-2.25" unit="D" />
        </EyeRow>
        <div className="text-label font-medium text-foreground">散光度數 (CYL)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.rx_R_cylinder} onChange={v => set('rx_R_cylinder', v)} placeholder="-0.75" unit="D" />
          <NumberInput label="左眼 L" value={data.rx_L_cylinder} onChange={v => set('rx_L_cylinder', v)} placeholder="-0.50" unit="D" />
        </EyeRow>
        <div className="text-label font-medium text-foreground">軸度 (AXIS)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.rx_R_axis} onChange={v => set('rx_R_axis', v)} placeholder="180" unit="°" step={1} />
          <NumberInput label="左眼 L" value={data.rx_L_axis} onChange={v => set('rx_L_axis', v)} placeholder="175" unit="°" step={1} />
        </EyeRow>
        <div className="text-label font-medium text-foreground">瞳距 (PD)</div>
        <EyeRow>
          <NumberInput label="遠用" value={data.pd_distance} onChange={v => set('pd_distance', v)} placeholder="63" unit="mm" step={0.5} />
          <NumberInput label="近用" value={data.pd_near} onChange={v => set('pd_near', v)} placeholder="60" unit="mm" step={0.5} />
        </EyeRow>
        <div>
          <label className="text-label text-muted-foreground block mb-1">鏡片類型</label>
          <input
            type="text"
            value={data.lens_type ?? ''}
            onChange={e => set('lens_type', e.target.value || undefined)}
            placeholder="例：漸進多焦點"
            className="w-full bg-card rounded-md shadow-card px-3 py-3.5 text-body text-card-foreground placeholder:text-muted-foreground touch-target"
          />
        </div>
      </div>

      {/* Keratometry */}
      <SectionTitle>🔵 角膜弧度儀</SectionTitle>
      <div className="space-y-3">
        <div className="text-label font-medium text-foreground">K1 (平坦面)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.k1_R} onChange={v => set('k1_R', v)} placeholder="43.5" unit="D" step={0.01} />
          <NumberInput label="左眼 L" value={data.k1_L} onChange={v => set('k1_L', v)} placeholder="43.5" unit="D" step={0.01} />
        </EyeRow>
        <div className="text-label font-medium text-foreground">K2 (陡峭面)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.k2_R} onChange={v => set('k2_R', v)} placeholder="44.5" unit="D" step={0.01} />
          <NumberInput label="左眼 L" value={data.k2_L} onChange={v => set('k2_L', v)} placeholder="44.5" unit="D" step={0.01} />
        </EyeRow>
      </div>

      {/* Dry Eye */}
      <SectionTitle>💧 乾眼檢測</SectionTitle>
      <EyeRow>
        <NumberInput label="淚膜破裂 (TBUT)" value={data.tbut} onChange={v => set('tbut', v)} placeholder="10" unit="秒" step={1} />
        <NumberInput label="Schirmer" value={data.schirmer_test} onChange={v => set('schirmer_test', v)} placeholder="15" unit="mm" step={1} />
      </EyeRow>
    </div>
  );
};

export default OptometryForm;
