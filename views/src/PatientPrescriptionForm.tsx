import React from 'react';
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

const normalizeMfeProps = (
    props: RawMfeProps | undefined,
): { form: FormMethods | undefined; item: FieldItem | undefined } => {
    const hasNestedProps = Boolean(props && props.props && (props.props.form || props.props.item));
    const effective = hasNestedProps && props ? props.props : props;

    return {
        form: effective?.form,
        item: effective?.item,
    };
};

const inputClassName = 'form-control w-full border border-gray-300 rounded-md p-3';
const labelClassName = 'block text-gray-700 font-semibold mb-2';

const PatientPrescriptionForm = (props: RawMfeProps) => {
    const { form, item } = normalizeMfeProps(props);
    const { control } = form || {};

    const isDisabled = Boolean(item?.disabled);
    const isNameRequired = item?.constraints?.required !== false && !isDisabled;

    if (!control) {
        return (
            <div className="border border-teal-100 rounded-xl shadow-lg bg-white p-6 text-gray-600 max-w-2xl mx-auto my-6">
                Komponen ini membutuhkan instance form dari platform Alurkerja.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden max-w-2xl mx-auto my-6">
            {/* Header Portal */}
            <div className="bg-blue-600 px-6 py-5 text-center">
                <h2 className="text-2xl font-bold text-white mb-1">Apotek Tiarana Farma</h2>
                <p className="text-blue-100 text-sm">Form Pemesanan Obat Kategori Khusus (Prekursor)</p>
            </div>

            <div className="p-6 md:p-8">
                {/* Info Box */}
                <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                    ⚠️ <strong>Perhatian:</strong> Sesuai regulasi BPOM, pembelian obat yang mengandung Pseudoephedrine (seperti Tremenza & Rhinos) mewajibkan pendataan identitas pasien. Apoteker kami berhak menolak pesanan jika indikasi medis tidak sesuai.
                </div>

                <div className="space-y-5">
                    <div>
                        <label htmlFor="nama_pasien" className={labelClassName}>Nama Lengkap Pasien *</label>
                        <Controller
                            name="nama_pasien"
                            control={control}
                            rules={{ required: isNameRequired ? 'Nama pasien wajib diisi' : false }}
                            render={({ field, fieldState }) => (
                                <div>
                                    <input
                                        id="nama_pasien"
                                        type="text"
                                        className={inputClassName}
                                        placeholder="Masukkan nama sesuai KTP"
                                        disabled={isDisabled}
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

                    <div>
                        <label htmlFor="kontak_pasien" className={labelClassName}>Nomor WhatsApp *</label>
                        <Controller
                            name="kontak_pasien"
                            control={control}
                            rules={{ required: isNameRequired ? 'Nomor WhatsApp wajib diisi' : false }}
                            render={({ field, fieldState }) => (
                                <div>
                                    <input
                                        id="kontak_pasien"
                                        type="tel"
                                        className={inputClassName}
                                        placeholder="Contoh: 081234567890"
                                        disabled={isDisabled}
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
                    
                    <div>
                        <label htmlFor="alamat_pasien" className={labelClassName}>Alamat *</label>
                        <Controller
                            name="alamat_pasien"
                            control={control}
                            rules={{ required: isNameRequired ? 'Alamat wajib diisi' : false }}
                            render={({ field, fieldState }) => (
                                <div>
                                    <input
                                        id="alamat_pasien"
                                        type="text"
                                        className={inputClassName}
                                        placeholder="Contoh: Jl. Widya Praja No. 12, RT 03/RW 05, Kel. Sukamaju..."
                                        disabled={isDisabled}
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

                    <div>
                        <label htmlFor="pilihan_obat" className={labelClassName}>Pilih Obat *</label>
                        <Controller
                            name="pilihan_obat"
                            control={control}
                            rules={{ required: isNameRequired ? 'Pilihan obat wajib diisi' : false }}
                            render={({ field, fieldState }) => (
                                <div>
                                    <select
                                        id="pilihan_obat"
                                        className={inputClassName}
                                        disabled={isDisabled}
                                        name={field.name}
                                        ref={field.ref}
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                    >
                                        <option value="" disabled>-- Silakan Pilih Obat --</option>
                                        <option value="Tremenza Tablet">Tremenza Tablet</option>
                                        <option value="Rhinos SR">Rhinos SR Kapsul</option>
                                    </select>
                                    {fieldState?.error && (
                                        <p className="mt-1 text-sm text-red-600" role="alert">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />
                    </div>

                    {/* ---> TAMBAHAN FIELD JUMLAH OBAT DI SINI <--- */}
                    {(() => {
                        const pilihanObat = typeof form?.watch === 'function' ? form.watch('pilihan_obat') : '';
                        let aturanTeks = "Masukkan jumlah yang ingin dibeli";
                        if (pilihanObat === 'Tremenza Tablet') aturanTeks = "Informasi: Maksimal pembelian 1 strip.";
                        if (pilihanObat === 'Rhinos SR') aturanTeks = "Informasi: Bisa dibeli per biji (kapsul).";

                        return (
                            <div>
                                <label htmlFor="jumlah_obat" className={labelClassName}>Jumlah Obat *</label>
                                <Controller
                                    name="jumlah_obat"
                                    control={control}
                                    rules={{ required: isNameRequired ? 'Jumlah obat wajib diisi' : false }}
                                    render={({ field, fieldState }) => (
                                        <div>
                                            <input
                                                id="jumlah_obat"
                                                type="text"
                                                className={inputClassName}
                                                placeholder="Contoh: 1 strip / 5 biji"
                                                disabled={isDisabled}
                                                name={field.name}
                                                ref={field.ref}
                                                value={field.value ?? ''}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                            />
                                            <p className="mt-1 text-xs text-blue-600 font-semibold">{aturanTeks}</p>
                                            {fieldState?.error && (
                                                <p className="mt-1 text-sm text-red-600" role="alert">{fieldState.error.message}</p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        );
                    })()}
                    {/* ---> AKHIR TAMBAHAN <--- */}
                    
                    <div>
                        <label htmlFor="keluhan_pasien" className={labelClassName}>Keluhan Medis / Gejala *</label>
                        <Controller
                            name="keluhan_pasien"
                            control={control}
                            rules={{ required: isNameRequired ? 'Keluhan wajib diisi untuk verifikasi apoteker' : false }}
                            render={({ field, fieldState }) => (
                                <div>
                                    <textarea
                                        id="keluhan_pasien"
                                        rows={3}
                                        className={inputClassName}
                                        placeholder="Jelaskan keluhan Anda (misal: Hidung tersumbat parah, bersin-bersin sejak 2 hari lalu...)"
                                        disabled={isDisabled}
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
                </div>
            </div>
        </div>
    );
};

export default PatientPrescriptionForm;