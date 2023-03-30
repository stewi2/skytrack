import React, { useLayoutEffect, useRef } from 'react';
import { renderToString } from 'react-dom/server'
import $ from 'jquery';
import DataTable from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-scroller-bs5';
import 'datatables.net-fixedheader-bs5';
import 'datatables.net-select-bs5';
import { PredictionsLink } from './helpers';

window.luxon = require('luxon');
window.$ = $;

const SatellitesListTable = (props) => {
  const tableRef = useRef();

  useLayoutEffect(() => {
    $(tableRef.current).DataTable({
      data: props.data,
      columns: [
        { title: 'NORAD id', data: 'id', responsivePriority: 2 },
        { title: 'Name', data: 'name', responsivePriority: 1 },
        { title: 'Epoch', data: 'epoch', render: DataTable.render.datetime('DD'), responsivePriority: 3 },
        { data: ( row, type, set, meta ) => renderToString(<PredictionsLink {...row} />),
          responsivePriority: 1,
          sortable: false
        },
      ],
      language: {
        loadingRecords: '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>'
      },
      responsive: true,
      fixedHeader: false,
      deferRender: true,
      scrollCollapse: true,
      scroller: true,
      scrollY:  '50vh',
      dom: 'frti'
    });

    return () => {
      $('#satellites').DataTable().destroy(false);
    };
  });

  return (
    <table id="satellites" ref={tableRef} className="table table-striped compact nowrap" />
  );
};

export default SatellitesListTable;
