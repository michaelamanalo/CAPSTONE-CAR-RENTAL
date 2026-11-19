import React from 'react';
import { isDemoMode } from '../services/demoMode';
import { canDeleteDemoRecord, deleteDemoRecord } from '../services/demoStore';
import './DemoDeleteButton.css';

export default function DemoDeleteButton({ tableName, id, itemName = 'sample record', onDeleted }) {
  if (!isDemoMode || !canDeleteDemoRecord(tableName, id)) return null;

  function handleDelete(event) {
    event.stopPropagation();
    if (deleteDemoRecord(tableName, id)) onDeleted?.();
  }

  return (
    <button className="demo-delete-button" type="button" onClick={handleDelete} aria-label={'Delete ' + itemName}>
      Delete
    </button>
  );
}
