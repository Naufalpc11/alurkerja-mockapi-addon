import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

type FieldItem = {
    name?: string;
    disabled?: boolean;
    constraints?: {
        required?: boolean;
    };
    [key: string]: unknown;
};

type FormMethods = {
    register?: (name: string, options?: Record<string, unknown>) => Record<string, unknown>;
    setValue?: (name: string, value: unknown, options?: Record<string, boolean>) => void;
    watch?: (name: string) => unknown;
    getValues?: (name?: string) => unknown;
    control?: any;
};

type RawMfeProps = {
    props?: {
        form?: FormMethods;
        item?: FieldItem;
    };
    form?: FormMethods;
    item?: FieldItem;
    alurkerjaParams?: Record<string, unknown>;
};

// Platform memanggil komponent MFE dengan bentuk { props: { form, item }, alurkerjaParams }.
// Bentuk lama { form, item, alurkerjaParams } tetap didukung agar kompatibel.
const normalizeMfeProps = (
    props: RawMfeProps | undefined,
): { form: FormMethods | undefined; item: FieldItem | undefined; alurkerjaParams?: Record<string, unknown> } => {
    const hasNestedProps = Boolean(props && props.props && (props.props.form || props.props.item));
    const effective = hasNestedProps && props ? props.props : props;

    return {
        form: effective?.form,
        item: effective?.item,
        alurkerjaParams: props?.alurkerjaParams,
    };
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
    typeof value === 'object' && value !== null && !Array.isArray(value)
);

const getNestedRecord = (source: unknown, key: string): Record<string, unknown> | undefined => {
    if (!isRecord(source)) return undefined;

    const nestedValue = source[key];
    return isRecord(nestedValue) ? nestedValue : undefined;
};

const pickFirst = (values: unknown[]): unknown => (
    values.find((value) => value !== undefined && value !== null && value !== '')
);

const toText = (value: unknown): string => {
    if (value === undefined || value === null || value === '') return '-';
    return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : JSON.stringify(value);
};

const ApotekerReviewForm = (props: RawMfeProps) => {
    const { form, item, alurkerjaParams } = normalizeMfeProps(props);
    const { control, setValue, watch, getValues } = form || {};

    const isDisabled = Boolean(item?.disabled);

    // Baca nilai dari banyak bentuk data: nama datar, prefix value.*, alurkerjaParams,
    // variables, processVariables, dan item.
    const getVal = (namaVar: string): unknown => {
        const prefixedName = `value.${namaVar}`;
        const sources: unknown[] = [
            typeof watch === 'function' ? watch(prefixedName) : undefined,
            typeof watch === 'function' ? watch(namaVar) : undefined,
            typeof getValues === 'function' ? getValues(prefixedName) : undefined,
            typeof getValues === 'function' ? getValues(namaVar) : undefined,
            alurkerjaParams?.[namaVar],
            getNestedRecord(alurkerjaParams, 'value')?.[namaVar],
            getNestedRecord(alurkerjaParams, 'variables')?.[namaVar],
            getNestedRecord(alurkerjaParams, 'processVariables')?.[namaVar],
            getNestedRecord(alurkerjaParams, 'process_variables')?.[namaVar],
        ];

        return pickFirst(sources);
    };

    const nama = toText(getVal('nama_pasien'));
    const wa = toText(getVal('kontak_pasien'));
    const alamat = toText(getVal('alamat_pasien'));
    const obat = toText(getVal('pilihan_obat'));
    const jumlahObat = toText(getVal('jumlah_obat'));
    const keluhan = toText(getVal('keluhan_pasien'));

    const [status, setStatus] = useState<string>('');

    const handleDecision = (decision: string) => {
        setStatus(decision);
        if (typeof setValue === 'function') {
            setValue('approval_status', decision, { shouldDirty: true });
        }
    };

    if (!control) {
        // Tanpa instance form, komponen tetap bisa menampilkan data sebagai read-only.
        return (
            <div className="bg-white rounded-xl shadow border border-gray-200 mt-4 max-w-3xl mx-auto">
                <div className="bg-slate-800 px-6 py-4">
                    <h3 className="text-white font-bold text-lg m-0">Pesanan Prekursor</h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded border">
                        <div><p className="text-sm text-gray-500 font-semibold">Nama Pasien</p><p className="font-bold">{nama}</p></div>
                        <div><p className="text-sm text-gray-500 font-semibold">No. WhatsApp</p><p className="font-bold">{wa}</p></div>
                        <div><p className="text-sm text-gray-500 font-semibold">Alamat</p><p className="font-bold">{alamat}</p></div>
                        <div><p className="text-sm text-gray-500 font-semibold">Obat Dipesan</p><p className="font-bold text-blue-700">{obat}</p></div>
                        <div><p className="text-sm text-gray-500 font-semibold">Jumlah</p><p className="font-bold text-red-600">{jumlahObat}</p></div>
                        <div className="col-span-2"><p className="text-sm text-gray-500 font-semibold">Keluhan / Indikasi</p><p className="text-gray-800 bg-white p-2 border rounded mt-1">{keluhan}</p></div>
                    </div>
                    <p className="text-sm text-gray-500">Komponen ini membutuhkan instance form dari platform Alurkerja untuk proses keputusan.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow border border-gray-200 mt-4 max-w-3xl mx-auto">
            <div className="bg-slate-800 px-6 py-4">
                <h3 className="text-white font-bold text-lg m-0">Pesanan Prekursor</h3>
            </div>
            <div className="p-6">
                {/* Bagian 1: Tampilkan Data Pasien */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded border">
                    <div><p className="text-sm text-gray-500 font-semibold">Nama Pasien</p><p className="font-bold">{nama}</p></div>
                    <div><p className="text-sm text-gray-500 font-semibold">No. WhatsApp</p><p className="font-bold">{wa}</p></div>
                    <div><p className="text-sm text-gray-500 font-semibold">Alamat</p><p className="font-bold">{alamat}</p></div>
                    <div><p className="text-sm text-gray-500 font-semibold">Obat Dipesan</p><p className="font-bold text-blue-700">{obat}</p></div>
                    <div><p className="text-sm text-gray-500 font-semibold">Jumlah</p><p className="font-bold text-red-600">{jumlahObat}</p></div>
                    <div className="col-span-2"><p className="text-sm text-gray-500 font-semibold">Keluhan / Indikasi</p><p className="text-gray-800 bg-white p-2 border rounded mt-1">{keluhan}</p></div>
                </div>

                {/* Bagian 2: Tombol Keputusan */}
                <div className="border-t pt-4">
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleDecision('approve')}
                            className={`px-4 py-2 rounded font-bold ${status === 'approve' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Approve
                        </button>
                        <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleDecision('reject')}
                            className={`px-4 py-2 rounded font-bold ${status === 'reject' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                        >
                            Reject
                        </button>
                    </div>

                    {/* Form Dinamis Berdasarkan Keputusan */}
                    {status === 'approve' && (
                        <div className="bg-green-50 p-4 rounded border border-green-200">
                            <label htmlFor="total_harga" className="block text-green-800 font-semibold mb-2">Total Harga Obat (Rp)</label>
                            <Controller
                                name="total_harga"
                                control={control}
                                rules={{ required: 'Total harga wajib diisi saat approve' }}
                                render={({ field, fieldState }) => (
                                    <div>
                                        <input
                                            id="total_harga"
                                            type="number"
                                            className="form-control w-full border-gray-300 rounded p-2"
                                            name={field.name}
                                            ref={field.ref}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                        />
                                        {fieldState?.error && (
                                            <p className="mt-1 text-sm text-red-600" role="alert">{fieldState.error.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    )}
                    {status === 'reject' && (
                        <div className="bg-red-50 p-4 rounded border border-red-200">
                            <label htmlFor="catatan_penolakan" className="block text-red-800 font-semibold mb-2">Alasan Penolakan</label>
                            <Controller
                                name="catatan_penolakan"
                                control={control}
                                rules={{ required: 'Alasan penolakan wajib diisi' }}
                                render={({ field, fieldState }) => (
                                    <div>
                                        <textarea
                                            id="catatan_penolakan"
                                            rows={3}
                                            className="form-control w-full border-gray-300 rounded p-2"
                                            name={field.name}
                                            ref={field.ref}
                                            value={field.value ?? ''}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                        />
                                        {fieldState?.error && (
                                            <p className="mt-1 text-sm text-red-600" role="alert">{fieldState.error.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApotekerReviewForm;