import { OphthalmologyRecord, ControlType } from '@/types';

interface Props {
  data: Partial<OphthalmologyRecord>;
  onChange: (data: Partial<OphthalmologyRecord>) => void;
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

const cataractOptions = [
  { value: 'none', label: '無' },
  { value: 'mild', label: '輕微' },
  { value: 'observe', label: '觀察' },
  { value: 'operable', label: '可手術' },
];

const retinalOptions = [
  { value: 'normal', label: '正常' },
  { value: 'follow_up', label: '追蹤' },
  { value: 'abnormal', label: '異常' },
];

const amdOptions = [
  { value: 'none', label: '無' },
  { value: 'early', label: '早期' },
  { value: 'intermediate', label: '中期' },
  { value: 'advanced', label: '晚期' },
];

const drOptions = [
  { value: 'none', label: '無' },
  { value: 'mild', label: '輕度' },
  { value: 'moderate', label: '中度' },
  { value: 'severe', label: '重度' },
];

const controlOptions = [
  { value: 'none', label: '無' },
  { value: 'atropine_001', label: '低濃度散瞳 0.01%' },
  { value: 'atropine_005', label: '低濃度散瞳 0.05%' },
  { value: 'orthokeratology', label: '角膜塑型片' },
  { value: 'myopia_control_lens', label: '近視控制鏡片' },
];

const freqOptions = [
  { value: 'daily', label: '每天' },
  { value: 'alternate', label: '隔天' },
  { value: 'weekend', label: '週末' },
];

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-body font-semibold text-foreground mt-6 mb-3 flex items-center gap-2">{children}</h3>
);

const EyeRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-3">{children}</div>
);

const OphthalmologyForm = ({ data, onChange }: Props) => {
  const set = <K extends keyof OphthalmologyRecord>(key: K, val: OphthalmologyRecord[K] | undefined) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="space-y-1">
      <p className="text-label text-muted-foreground mb-2">所有欄位皆為選填，可稍後補充</p>

      {/* Cycloplegic Refraction */}
      <SectionTitle>💧 散瞳驗光</SectionTitle>
      <div className="space-y-3">
        <div className="text-label font-medium text-foreground">球面度數 (SPH)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.cycloplegic_R_sphere} onChange={v => set('cycloplegic_R_sphere', v)} placeholder="-2.75" unit="D" />
          <NumberInput label="左眼 L" value={data.cycloplegic_L_sphere} onChange={v => set('cycloplegic_L_sphere', v)} placeholder="-2.50" unit="D" />
        </EyeRow>
        <div className="text-label font-medium text-foreground">散光度數 (CYL)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.cycloplegic_R_cylinder} onChange={v => set('cycloplegic_R_cylinder', v)} placeholder="-0.75" unit="D" />
          <NumberInput label="左眼 L" value={data.cycloplegic_L_cylinder} onChange={v => set('cycloplegic_L_cylinder', v)} placeholder="-0.50" unit="D" />
        </EyeRow>
        <div className="text-label font-medium text-foreground">軸度 (AXIS)</div>
        <EyeRow>
          <NumberInput label="右眼 R" value={data.cycloplegic_R_axis} onChange={v => set('cycloplegic_R_axis', v)} placeholder="180" unit="°" step={1} />
          <NumberInput label="左眼 L" value={data.cycloplegic_L_axis} onChange={v => set('cycloplegic_L_axis', v)} placeholder="175" unit="°" step={1} />
        </EyeRow>
      </div>

      {/* Axial Length */}
      <SectionTitle>📏 眼軸長度</SectionTitle>
      <EyeRow>
        <NumberInput label="右眼 R" value={data.axial_length_R} onChange={v => set('axial_length_R', v)} placeholder="24.0" unit="mm" step={0.01} />
        <NumberInput label="左眼 L" value={data.axial_length_L} onChange={v => set('axial_length_L', v)} placeholder="23.8" unit="mm" step={0.01} />
      </EyeRow>

      {/* IOP */}
      <SectionTitle>🫧 眼壓</SectionTitle>
      <EyeRow>
        <NumberInput label="右眼 R" value={data.iop_R} onChange={v => set('iop_R', v)} placeholder="15" unit="mmHg" step={1} />
        <NumberInput label="左眼 L" value={data.iop_L} onChange={v => set('iop_L', v)} placeholder="16" unit="mmHg" step={1} />
      </EyeRow>

      {/* Cataract */}
      <SectionTitle>🔍 白內障</SectionTitle>
      <EyeRow>
        <SelectInput label="右眼 R" value={data.cataract_R} onChange={v => set('cataract_R', v as any)} options={cataractOptions} />
        <SelectInput label="左眼 L" value={data.cataract_L} onChange={v => set('cataract_L', v as any)} options={cataractOptions} />
      </EyeRow>

      {/* Retinal */}
      <SectionTitle>👁️ 眼底檢查</SectionTitle>
      <SelectInput label="眼底狀態" value={data.retinal_exam} onChange={v => set('retinal_exam', v as any)} options={retinalOptions} />
      <div className="mt-3 space-y-3">
        <EyeRow>
          <SelectInput label="黃斑部病變 (AMD)" value={data.amd_grade} onChange={v => set('amd_grade', v)} options={amdOptions} />
          <SelectInput label="糖尿病視網膜 (DR)" value={data.dr_grade} onChange={v => set('dr_grade', v)} options={drOptions} />
        </EyeRow>
      </div>

      {/* Myopia Control */}
      <SectionTitle>🛡️ 近視控制</SectionTitle>
      <SelectInput label="控制方式" value={data.control_type} onChange={v => set('control_type', v as ControlType)} options={controlOptions} />
      {(data.control_type === 'atropine_001' || data.control_type === 'atropine_005') && (
        <div className="mt-3">
          <SelectInput label="點藥頻率" value={data.atropine_frequency} onChange={v => set('atropine_frequency', v)} options={freqOptions} />
        </div>
      )}
    </div>
  );
};

export default OphthalmologyForm;
