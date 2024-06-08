import { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import PackageType from '@/components/PackageType';
import TableDataList from '@/components/TableDataList';
import { EPackageType } from '@/constants/packages';
import { DemoPackageResponseDto } from '@/interfaces/Response/DemoPackageResponseDto';

import styles from './packages.module.scss';
import TableAction from '@/components/TableAction';
import { formatNumber } from '@/utils/common';
import SearchBox from '@/components/SearchBox/SearchBox';
import { executeDeleteWithBody } from '@/utils/http-client';
import toast from 'react-hot-toast';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { BaseResponseDto } from '@/interfaces/Response/BaseResponseDto';
import { decodeJwt, getValue } from '@/utils/application';

const Packages = () => {
    let packageId = 0;
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [refreshTable, setRefreshTable] = useState(false);
    const token = getValue('token');
    const [auth] = useState(decodeJwt(token || ""));
    const options = {
        title: 'XÁC NHẬN',
        message: 'Bạn có muốn xóa gói tập?',
        buttons: [
            {
                label: 'Yes',
                onClick: async () => {
                    try {

                        const { data }: { data: BaseResponseDto<string> } = await executeDeleteWithBody(`/api/DemoPackage/${packageId}`);
                        if (data.hasError === false) {
                            toast.success('Xóa gói tập thành công');
                        }
                        else {
                            toast.error('Xóa gói tập thất bại');
                        }
                        setRefreshTable(!refreshTable);
                    } catch (error) {
                        // toast.error('Delete Package Error!');
                    } finally {
                        setSearchTerm("");
                        // setIsLoading(false);
                    }
                }
            },
            {
                label: 'No',
                onClick: () => { }
            }
        ],
        closeOnEscape: true,
        closeOnClickOutside: true,
        keyCodeForClose: [8, 32],
        overlayClassName: "overlay-custom-class-name"
    };

    const handleDeleteClick = (id: number) => {
        packageId = id;
        confirmAlert(options);
    };

    const handleCreateSellPackage = (id: number) => {
        navigate(`/consultant-package/create?id=${id}`,
            {
                state: {
                    "id": id
                }
            }
        );
    };

    const cols = useMemo<ColumnDef<DemoPackageResponseDto>[]>(
        () => [
            { header: 'Tiêu đề', accessorKey: 'packageName' },
            { header: 'Mô tả', accessorKey: 'descriptions' },
            { header: 'Số ngày tập', accessorKey: 'numberOfDays' },
            { header: 'Số buổi tập', accessorKey: 'numberOfSessions' },
            {
                header: 'Giá',
                accessorKey: 'packagePrice',

                cell: (value) => (
                    formatNumber(value.getValue() as number)
                )
            },
            {
                header: 'Loại',
                accessorKey: 'type',
                cell: (value) => (
                    <PackageType text={value.getValue() as string} type={value.getValue() as EPackageType} />
                ),
            },
            { header: 'Cơ sở', accessorKey: 'branch.branchName' },
            {
                header: 'Thao tác',
                cell: (x) => (
                    <TableAction
                        onEditClick={() => {
                            navigate('/package-detail', {
                                state: {
                                    "url": x.cell.row.original.imageUrl,
                                    "id": x.cell.row.original.id,
                                    "packageName": x.cell.row.original.packageName,
                                    "descriptions": x.cell.row.original.descriptions,
                                    "numberOfDays": x.cell.row.original.numberOfDays,
                                    "numberOfSessions": x.cell.row.original.numberOfSessions,
                                    "packagePrice": x.cell.row.original.packagePrice,
                                    "type": x.cell.row.original.type,
                                    "branchId": x.cell.row.original.branch.id,
                                }
                            }
                            );
                        }
                        }
                        onDeleteClick={() => handleDeleteClick(x.cell.row.original.id)}
                        onCreateSellPackage={() => handleCreateSellPackage(x.row.original.id)}
                    />
                ),
            },
        ],
        [searchTerm, refreshTable],
    );

    const navigate = useNavigate();
    const handleCreatePackageClick = () => {
        navigate('/package-create');
    };
    const handleChangeSearchBox = (x: any) => {
        console.log(x.target.value);
        setSearchTerm(x.target.value);
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <span>Gói tập </span>
                </div>
                <div className={styles.left}>
                    <SearchBox
                        onChange={(x) => handleChangeSearchBox(x)}
                        value={searchTerm} />
                    {auth.payload.roles === "Manager" && <Button
                        content={<span>Tạo gói tập</span>}
                        className={styles.button}
                        onClick={handleCreatePackageClick}
                    />}
                </div>
            </div>
            <div className={styles.table}>
                <TableDataList cols={cols} path={`/api/DemoPackage?query=${searchTerm}`} key={searchTerm} isRefresh={refreshTable} />
            </div>
        </div>
    );
};

export default Packages;
