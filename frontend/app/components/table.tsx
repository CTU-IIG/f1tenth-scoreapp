"use strict";

import React, { Key } from 'react';
import { useFormatMessageId } from '../helpers/hooks';
import classNames from 'classnames';


export interface TableColumn<ItemType> {
	name: string;
	type?: 'string' | 'number';
	formatter: (item: ItemType) => any,
}

export interface TableProps<ItemType> {
	columns: TableColumn<ItemType>[],
	getRowKey: (item: ItemType) => Key,
	data: ItemType[],
}

export const Table = <ItemType extends any>(props: TableProps<ItemType>) => {

	const { columns, data, getRowKey } = props;

	const t = useFormatMessageId();

	return (
		<table className="table">

			<thead>
				<tr>
					{columns.map(({ name, type }) => (
						<th
							key={name}
							className={classNames({
								'column--number': type === 'number',
							})}
						>
							{t(name)}
						</th>
					))}
				</tr>
			</thead>

			<tbody>
				{data.map(item => (
					<tr key={getRowKey(item)}>
						{columns.map(({ name, type, formatter }) => (
							<td
								key={name}
								className={classNames({
									'column--number': type === 'number',
								})}
							>
								{formatter(item)}
							</td>
						))}
					</tr>
				))}
			</tbody>

		</table>
	);

};
