"use client";

import React from "react";
import useSWR from "swr";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Select,
  SelectItem,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import type { SortDescriptor } from "@heroui/react";
import { SearchIcon, ChevronDownIcon } from "./icons";
import { PlusIcon, RefreshCcw, StickyNote } from "lucide-react";
import { fetcher } from "@/utils/fetcher";
import { Application, ApplicationListResponse, StatusOption } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { DateRangePicker } from "./date-range/date-range-picker";
import {
  formatDate,
  formatDateTimeVN,
  getDefaultDateRange,
} from "@/utils/functions";
import NotesModal from "@/components/notes-modal";
import ApplicationModal from "@/components/application-modal";
import { APPLICATION_STATUS_MAP } from "@/utils/constants";

/* ================= COLUMNS ================= */

const columns = [
  { name: "CODE", uid: "code", sortable: true },
  { name: "MÃ KHÁCH HÀNG", uid: "customer__code" },
  { name: "FULL NAME", uid: "fullname" },
  { name: "GIỚI TÍNH", uid: "sex__name" },
  { name: "GIẤY TỜ", uid: "legal_type__name" },
  { name: "MÃ SỐ", uid: "legal_code" },
  { name: "LOẠI SẢN PHẨM", uid: "product__type__name" },
  { name: "TÀI SẢN CẦM CỐ", uid: "product__category__name" },
  { name: "LOẠI TIỀN", uid: "currency__code" },
  { name: "NGƯỜI TẠO ĐƠN", uid: "creator__fullname" },
  { name: "NGUỒN", uid: "source__name" },
  { name: "LOAN CODE", uid: "loanapp__code" },
  { name: "PROVINCE", uid: "province" },
  { name: "DISTRICT", uid: "district" },
  { name: "ADDRESS", uid: "address" },
  { name: "LOAN AMOUNT", uid: "loan_amount" },
  { name: "TERM", uid: "loan_term" },
  { name: "STATUS", uid: "status" },
  { name: "NOTE", uid: "note" },
  { name: "CREATED TIME", uid: "create_time" },
];

const INITIAL_VISIBLE_COLUMNS = [
  "code",
  "fullname",
  "province",
  "district",
  "loan_amount",
  "loan_term",
  "status",
  "note",
  "create_time",
];

const STATUS_OPTIONS: StatusOption[] = [
  { value: 0, label: "Tất cả", color: "default" },
  { value: 1, label: "Mới khởi tạo", color: "default" },
  { value: 2, label: "Chờ thẩm định", color: "warning" },
  { value: 3, label: "Bổ sung thông tin", color: "primary" },
  { value: 4, label: "Từ chối", color: "danger" },
  { value: 5, label: "Đồng ý", color: "success" },
  { value: 6, label: "Đã ký hợp đồng", color: "primary" },
  { value: 7, label: "Đã giải ngân", color: "secondary" },
];

/* ================= COMPONENT ================= */

const ROWS_PER_PAGE = 20;

export default function ApplicationContent() {
  const { profile } = useAuth();

  const {
    isOpen: isApplicationModalOpen,
    onOpen: onApplicationModalOpen,
    onClose: onApplicationModalClose,
  } = useDisclosure();
  const {
    isOpen: isNotesModalOpen,
    onOpen: onNotesModalOpen,
    onClose: onNotesModalClose,
  } = useDisclosure();

  /* ================= STATE ================= */

  const [dateRange, setDateRange] = React.useState(getDefaultDateRange);

  const [selectedApplication, setSelectedApplication] =
    React.useState<Application | null>(null);

  const [filterValue, setFilterValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<number>(0);
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(ROWS_PER_PAGE);
  const [page, setPage] = React.useState(1);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "code",
    direction: "descending",
  });

  const statusQuery = React.useMemo(() => {
    if (statusFilter === 0) return "";
    return statusFilter;
  }, [statusFilter]);

  const dateQuery = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "";

    return `from=${formatDate(dateRange.from)}&to=${formatDate(dateRange.to)}`;
  }, [dateRange]);

  const queryString = React.useMemo(() => {
    const params = [statusQuery, dateQuery].filter(Boolean);
    return params.length ? `&${params.join("&")}` : "";
  }, [statusQuery, dateQuery]);

  const { data, isLoading, mutate, isValidating } =
    useSWR<ApplicationListResponse>(
      profile?.id
        ? `/api/application?loginId=${profile.id}${queryString}`
        : null,
      fetcher
    );

  const applications = data?.rows ?? [];

  /* ================= FILTER ================= */

  const filteredItems = React.useMemo(() => {
    let items = [...applications];

    if (filterValue) {
      items = items.filter((app) =>
        app.fullname.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return items;
  }, [applications, filterValue]);

  /* ================= PAGINATION ================= */

  const pages = Math.ceil(filteredItems.length / rowsPerPage) || 1;

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredItems.slice(start, start + rowsPerPage);
  }, [page, filteredItems, rowsPerPage]);

  /* ================= SORT ================= */

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Application];
      const second = b[sortDescriptor.column as keyof Application];

      if (first < second)
        return sortDescriptor.direction === "ascending" ? -1 : 1;
      if (first > second)
        return sortDescriptor.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [items, sortDescriptor]);

  /* ================= HEADER ================= */

  const headerColumns = React.useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;
    return columns.filter((c) => Array.from(visibleColumns).includes(c.uid));
  }, [visibleColumns]);

  /* ================= RENDER CELL ================= */

  const renderCell = React.useCallback(
    (app: Application, columnKey: React.Key) => {
      switch (columnKey) {
        case "code":
          return (
            <Button
              size="sm"
              variant="light"
              className="text-primary text-sm"
              onPress={() => {
                setSelectedApplication(app);
                onApplicationModalOpen();
              }}
            >
              {app.code}
            </Button>
          );

        case "fullname":
          return (
            <div className="flex flex-col">
              <span>{app.fullname}</span>
              <span className="text-xs text-default-400">{app.phone}</span>
            </div>
          );

        case "province":
          return app.province;
        case "district":
          return app.district;
        case "address":
          return (
            <Tooltip
              showArrow
              classNames={{
                base: [
                  // arrow color
                  "before:bg-neutral-400 dark:before:bg-white",
                ],
                content: [
                  "py-2 px-4 shadow-xl",
                  "text-black bg-linear-to-br from-white to-neutral-400",
                ],
              }}
              content={app.address}
              placement="top"
            >
              <div className="truncate max-w-[100px] text-ellipsis overflow-hidden">
                {app.address}
              </div>
            </Tooltip>
          );

        case "loan_amount":
          return app.loan_amount.toLocaleString("vi-VN");

        case "loan_term":
          return `${app.loan_term}`;

        case "status":
          return (
            <Chip size="sm" color={APPLICATION_STATUS_MAP[app.status].color}>
              {APPLICATION_STATUS_MAP[app.status].label}
            </Chip>
          );
        case "note":
          const hasNote = app.note?.trim();
          return (
            <Button
              size="sm"
              isIconOnly
              variant={hasNote ? "flat" : "light"}
              color={hasNote ? "primary" : "default"}
              startContent={
                hasNote ? <StickyNote size={16} /> : <PlusIcon size={16} />
              }
              onPress={() => {
                setSelectedApplication(app);
                onNotesModalOpen();
              }}
            ></Button>
          );
        case "create_time":
          return (
            <div>
              <span className="text-default-400">
                {formatDateTimeVN(new Date(app.create_time)).split(" ")[1]}
              </span>
              <div className="text-primary text-xs">
                {formatDateTimeVN(new Date(app.create_time)).split(" ")[0]}
              </div>
            </div>
          );

        case "customer__code":
          return (app as any).customer__code || "/";
        case "sex__name":
          return (app as any).sex__name || "/";
        case "legal_type__name":
          return (app as any).legal_type__name || "/";
        case "legal_code":
          return app.legal_code || "/";
        case "product__type__name":
          return (app as any).product__type__name || "/";
        case "product__category__name":
          return (app as any).product__category__name || "/";
        case "currency__code":
          return (app as any).currency__code || "/";
        case "creator__fullname":
          return (app as any).creator__fullname || "/";
        case "source__name":
          return (app as any).source__name || "/";
        case "loanapp__code":
          return (app as any).loanapp__code || "/";

        default:
          return app[columnKey as keyof Application];
      }
    },
    []
  );

  /* ================= TOP CONTENT ================= */

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Application</h2>
        <DateRangePicker
          initialDateFrom={dateRange.from}
          initialDateTo={dateRange.to}
          onUpdate={(values) => {
            setDateRange({
              from: values.range.from,
              to: values.range.to ?? new Date(),
            });
            setPage(1);
          }}
        />
      </div>
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by fullname..."
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={(v) => {
            setFilterValue(v || "");
            setPage(1);
          }}
        />

        <div className="flex gap-2 items-center">
          <Select
            selectedKeys={[String(statusFilter)]}
            className="w-3xs"
            placeholder="Status"
            onSelectionChange={(keys) => {
              const value = Number(keys.currentKey);
              setStatusFilter(value);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={String(opt.value)} textValue={opt.label}>
                {opt.label}
              </SelectItem>
            ))}
          </Select>
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                variant="flat"
                endContent={<ChevronDownIcon className="text-small" />}
              >
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              selectionMode="multiple"
              disallowEmptySelection
              selectedKeys={visibleColumns}
              onSelectionChange={(keys) =>
                setVisibleColumns(new Set(keys as Iterable<string>))
              }
            >
              {columns.map((col) => (
                <DropdownItem key={col.uid}>{col.name}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            isIconOnly
            color="primary"
            variant="flat"
            onPress={() => mutate()}
            isDisabled={isLoading || isValidating}
          >
            <RefreshCcw
              size={16}
              className={isLoading || isValidating ? "animate-spin" : ""}
            />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center text-small text-default-400">
        <span>Total {filteredItems.length} applications</span>

        <label className="flex items-center gap-2">
          Rows per page:
          <select
            className="bg-transparent outline-none"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>
      </div>
    </div>
  );

  /* ================= BOTTOM CONTENT ================= */

  const bottomContent = (
    <div className="py-2 px-2 flex justify-between items-center">
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={pages}
        onChange={setPage}
      />
    </div>
  );

  /* ================= RENDER ================= */

  return (
    <>
      <Table
        isHeaderSticky
        aria-label="Application table"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              allowsSorting={column.sortable}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          items={sortedItems}
          emptyContent={isLoading ? "Loading..." : "No applications"}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      {isApplicationModalOpen && selectedApplication && profile && (
        <ApplicationModal
          loginId={profile?.id}
          application={selectedApplication}
          isOpen={isApplicationModalOpen}
          onClose={onApplicationModalClose}
        />
      )}
      {isNotesModalOpen && (
        <NotesModal
          application={selectedApplication}
          loginId={profile?.id || 0}
          isOpen={isNotesModalOpen}
          onClose={onNotesModalClose}
          onSuccess={() => {
            mutate(); // Refresh data after update
          }}
        />
      )}
    </>
  );
}
