/**
 * Data table: zebra rows, token-based. Use type-table-header and type-table-cell.
 */
export default {
  title: 'Components/DataTable',
  parameters: { layout: 'padded' },
};

export const Default = () => {
  const table = document.createElement('table');
  table.className = 'data-table';
  table.setAttribute('role', 'grid');
  table.innerHTML = `
    <thead>
      <tr>
        <th class="type-table-header" data-sortable>Name</th>
        <th class="type-table-header" data-sortable>Role</th>
        <th class="type-table-header">Score</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="type-table-cell">Alice</td>
        <td class="type-table-cell">Analyst</td>
        <td class="type-table-cell">92</td>
      </tr>
      <tr>
        <td class="type-table-cell">Bob</td>
        <td class="type-table-cell">Developer</td>
        <td class="type-table-cell">88</td>
      </tr>
      <tr>
        <td class="type-table-cell">Carol</td>
        <td class="type-table-cell">Designer</td>
        <td class="type-table-cell">95</td>
      </tr>
    </tbody>
  `;
  return table;
};
