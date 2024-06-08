import { faPenToSquare, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { faEye, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';

import styles from './table-action.module.scss';
import { decodeJwt, getValue } from '@/utils/application';

interface TableActionProps {
    onViewClick?: () => void;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
    onCreateSellPackage?: () => void;
}

const TableActionPackage: FC<TableActionProps> = ({ onEditClick, onDeleteClick, onCreateSellPackage, onViewClick }) => {
    const token = getValue('token');
    const [auth] = useState(decodeJwt(token || ""));
    return (
        <div className={styles.container}>
            {onViewClick && (
                <>
                    <FontAwesomeIcon icon={faEye} className={styles.edit} onClick={onViewClick} />
                    <span>|</span>
                </>
            )}
            {onEditClick && (
                <>
                    <FontAwesomeIcon icon={faPenToSquare} className={styles.edit} onClick={onEditClick} />
                    <span>|</span>
                </>
            )
            }
            <FontAwesomeIcon icon={faTrashCan} className={styles.delete} onClick={onDeleteClick} />
            {onCreateSellPackage && (auth?.payload?.roles === "Manager" || auth?.payload?.roles === "Staff") && (
                <>
                    <span>|</span>
                    <FontAwesomeIcon icon={faSquarePlus} className={styles.view} onClick={onCreateSellPackage} />
                </>
            )}

        </div>
    );
};

export default TableActionPackage;