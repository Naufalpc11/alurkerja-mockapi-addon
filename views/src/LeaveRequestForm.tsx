import React, { useEffect } from 'react';
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

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// Support format YYYY-MM-DD (dari input type="date"), DD-MM-YYYY, dan ISO.
export const parseDateValue = (value: unknown): Date | null => {
    if (typeof value !== 'string' || !value) return null;

    const ymd = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymd) {
        const date = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const dmy = value.match(/^(\d{2})-(\d{2})-(\d{4})/);
    if (dmy) {
        const date = new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

export const calculateTotalDays = (startValue: unknown, endValue: unknown): number | null => {
    const startDate = parseDateValue(startValue);
    const endDate = parseDateValue(endValue);

    if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
        return null;
    }

    return Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MILLISECONDS) + 1;
};

// Platform memanggil field MFE dengan bentuk { props: { form, item }, alurkerjaParams }.
// Bentuk lama { form, item, alurkerjaParams } tetap didukung agar kompatibel.
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

const inputClassName = 'form-control border p-2 w-full rounded';
const labelClassName = 'block mb-1 font-medium text-sm text-gray-700';

const LeaveRequestForm = (props: RawMfeProps) => {
    const { form, item } = normalizeMfeProps(props);
    const { control, setValue, watch, getValues } = form || {};

    // Jika item.disabled (misalnya pada tahap manager/read-only), seluruh isian
    // dimatikan tapi nilai yang sudah tersimpan tetap ditampilkan.
    const isDisabled = Boolean(item?.disabled);
    const isRequired = Boolean(item?.constraints?.required !== false && !isDisabled);

    // watch() me-subscribe komponen, sehingga total langsung terhitung ulang
    // setiap kali user mengganti tanggal — tanpa menunggu submit.
    const tanggalMulai = typeof watch === 'function'
        ? watch('tanggal_mulai')
        : getValues?.('tanggal_mulai');
    const tanggalSelesai = typeof watch === 'function'
        ? watch('tanggal_selesai')
        : getValues?.('tanggal_selesai');
    const totalDays = calculateTotalDays(tanggalMulai, tanggalSelesai);

    // Simpan hasil hitungan ke state form agar nilai total_hari ikut terkirim
    // sebagai variabel proses saat formulir disubmit.
    useEffect(() => {
        if (typeof setValue !== 'function') return;

        setValue('total_hari', totalDays ?? '', {
            shouldDirty: Boolean(tanggalMulai || tanggalSelesai),
            shouldValidate: true,
        });
    }, [tanggalMulai, tanggalSelesai, totalDays, setValue]);

    if (!control) {
        return (
            <div className="p-4 border rounded shadow-sm bg-white text-sm text-gray-600">
                Komponen ini membutuhkan instance form dari platform Alurkerja.
            </div>
        );
    }

    const minDate = typeof tanggalMulai === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(tanggalMulai)
        ? tanggalMulai
        : undefined;

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h4 className="mb-1 font-bold">Form Pengajuan Cuti</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="tanggal_mulai" className={labelClassName}>
                        Tanggal Mulai
                    </label>
                    <Controller
                        name="tanggal_mulai"
                        control={control}
                        rules={{ required: isRequired ? 'Tanggal mulai wajib diisi' : false }}
                        render={({ field, fieldState }) => (
                            <div>
                                <input
                                    id="tanggal_mulai"
                                    type="date"
                                    className={inputClassName}
                                    disabled={isDisabled}
                                    name={field.name}
                                    ref={field.ref}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                                {fieldState?.error && (
                                    <p className="mt-1 text-sm text-red-600" role="alert">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div>
                    <label htmlFor="tanggal_selesai" className={labelClassName}>
                        Tanggal Selesai
                    </label>
                    <Controller
                        name="tanggal_selesai"
                        control={control}
                        rules={{
                            required: isRequired ? 'Tanggal selesai wajib diisi' : false,
                            validate: (value: unknown) => (
                                !value
                                || !tanggalMulai
                                || calculateTotalDays(tanggalMulai, value) !== null
                                || 'Tanggal selesai tidak boleh sebelum tanggal mulai'
                            ),
                        }}
                        render={({ field, fieldState }) => (
                            <div>
                                <input
                                    id="tanggal_selesai"
                                    type="date"
                                    min={minDate}
                                    className={inputClassName}
                                    disabled={isDisabled}
                                    name={field.name}
                                    ref={field.ref}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                                {fieldState?.error && (
                                    <p className="mt-1 text-sm text-red-600" role="alert">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="total_hari" className={labelClassName}>
                        Total Hari Cuti
                    </label>
                    <Controller
                        name="total_hari"
                        control={control}
                        rules={{ required: isRequired ? 'Total hari cuti belum dapat dihitung' : false }}
                        render={({ field, fieldState }) => (
                            <div>
                                <input
                                    id="total_hari"
                                    type="number"
                                    tabIndex={-1}
                                    readOnly
                                    className={`${inputClassName} bg-gray-100`}
                                    name={field.name}
                                    ref={field.ref}
                                    value={totalDays ?? field.value ?? ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                                {fieldState?.error && (
                                    <p className="mt-1 text-sm text-red-600" role="alert">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                    {!totalDays && Boolean(tanggalMulai || tanggalSelesai) && (
                        <p className="mt-1 text-sm text-amber-700" role="alert">
                            Total hari belum dapat dihitung. Periksa kembali tanggal yang dipilih.
                        </p>
                    )}
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="alasan_cuti" className={labelClassName}>
                        Alasan Cuti
                    </label>
                    <Controller
                        name="alasan_cuti"
                        control={control}
                        rules={{ required: isRequired ? 'Alasan cuti wajib diisi' : false }}
                        render={({ field, fieldState }) => (
                            <div>
                                <textarea
                                    id="alasan_cuti"
                                    rows={4}
                                    className={inputClassName}
                                    placeholder="Jelaskan alasan pengajuan cuti"
                                    disabled={isDisabled}
                                    name={field.name}
                                    ref={field.ref}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                    onBlur={field.onBlur}
                                />
                                {fieldState?.error && (
                                    <p className="mt-1 text-sm text-red-600" role="alert">
                                        {fieldState.error.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default LeaveRequestForm;