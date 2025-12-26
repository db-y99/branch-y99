"use client";

import type { SortDescriptor } from "@heroui/react";

import React from "react";
import useSWR from "swr";
import { useDebounceValue } from "usehooks-ts";
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
  addToast,
} from "@heroui/react";
import { PlusIcon, RefreshCcw, StickyNote, RotateCw } from "lucide-react";

import { SearchIcon, ChevronDownIcon } from "./icons";
import { DateRangePicker } from "./date-range/date-range-picker";

import { fetcher } from "@/utils/fetcher";
import { Application, ApplicationListResponse, StatusOption } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import {
  formatDate,
  formatDateTimeVN,
  getDefaultDateRange,
} from "@/utils/functions";
import NotesModal from "@/components/notes-modal";
import ApplicationModal from "@/components/application-modal";
import { APPLICATION_STATUS_MAP } from "@/utils/constants";
import { updateApplicationRecordBranch } from "@/actions/application-records";

/* ================= COLUMNS ================= */

const columns = [
  { name: "CODE", uid: "code", sortable: false },
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
  { name: "BRANCH UUID", uid: "branch_uuid" },
  { name: "CREATED TIME", uid: "create_time", sortable: true },
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
  "branch_uuid",
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

export default function HomeContent() {
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
    column: "create_time",
    direction: "descending",
  });
  const [isSyncing, setIsSyncing] = React.useState(false);

  // Debounce search input to avoid too many API calls
  const [debouncedSearchValue] = useDebounceValue(filterValue, 500);

  // Reset to page 1 when debounced search value or status filter changes
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearchValue, statusFilter]);

  const statusQuery = React.useMemo(() => {
    if (statusFilter === 0) return "";

    return `status=${statusFilter}`;
  }, [statusFilter]);

  const dateQuery = React.useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return "";

    return `from=${formatDate(dateRange.from)}&to=${formatDate(dateRange.to)}`;
  }, [dateRange]);

  const queryString = React.useMemo(() => {
    const params = [
      statusQuery,
      dateQuery,
      debouncedSearchValue
        ? `search=${encodeURIComponent(debouncedSearchValue)}`
        : "",
      `page=${page}`,
      `limit=${rowsPerPage}`,
      // Only allow sorting by create_time
      sortDescriptor.column === "create_time"
        ? `sort=${sortDescriptor.column}&order=${sortDescriptor.direction === "ascending" ? "asc" : "desc"}`
        : "",
    ].filter(Boolean);

    return params.length ? `&${params.join("&")}` : "";
  }, [
    statusQuery,
    dateQuery,
    debouncedSearchValue,
    page,
    rowsPerPage,
    sortDescriptor,
  ]);

  const { data, isLoading, mutate, isValidating } =
    useSWR<ApplicationListResponse>(
      profile?.id
        ? `/api/application-records?loginId=${profile.id}${queryString}`
        : null,
      fetcher
    );

  const { data: branchesData } = useSWR<{
    rows: Array<{ id: string; name: string; code: string }>;
  }>("/api/branches", fetcher);

  const branches = branchesData?.rows ?? [];
  const applications = data?.rows ?? [];
  const totalRows = data?.total_rows || 0;

  /* ================= SYNC HANDLER ================= */

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/application/sync/super", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to sync");
      }

      addToast({
        title: "Đồng bộ thành công",
        description: `Đã đồng bộ ${result.synced_count || 0} bản ghi`,
        color: "success",
      });

      // Refresh data after sync
      mutate();
    } catch (error: any) {
      console.error("Error syncing:", error);
      addToast({
        title: "Đồng bộ thất bại",
        description: error.message || "Có lỗi xảy ra khi đồng bộ dữ liệu",
        color: "danger",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  /* ================= PAGINATION ================= */

  const pages = Math.ceil(totalRows / rowsPerPage) || 1;

  /* ================= SORT ================= */
  // Sort is handled on server side, no client-side sorting needed

  /* ================= HEADER ================= */

  const headerColumns = React.useMemo(() => {
    if (visibleColumns.size === columns.length) return columns;

    return columns.filter((c) => Array.from(visibleColumns).includes(c.uid));
  }, [visibleColumns]);

  /* ================= RENDER CELL ================= */

  const handleBranchChange = async (
    app: Application,
    newBranchUuid: string
  ) => {
    try {
      await updateApplicationRecordBranch(
        String(app.id),
        newBranchUuid || null
      );

      addToast({
        title: "Cập nhật thành công",
        description: "Đã cập nhật branch thành công",
        color: "success",
      });

      mutate();
    } catch (error: any) {
      console.error("Error updating branch:", error);
      addToast({
        title: "Cập nhật thất bại",
        description: error.message || "Có lỗi xảy ra khi cập nhật branch",
        color: "danger",
      });
    }
  };

  const renderCell = React.useCallback(
    (app: Application, columnKey: React.Key) => {
      switch (columnKey) {
        case "code":
          return (
            <Button
              className="text-primary text-sm"
              size="sm"
              variant="light"
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
            <Chip
              color={APPLICATION_STATUS_MAP[app.status].color || ""}
              size="sm"
            >
              {APPLICATION_STATUS_MAP[app.status].label}
            </Chip>
          );
        case "note":
          const hasNote = app.note?.trim();

          return (
            <Button
              isIconOnly
              color={hasNote ? "primary" : "default"}
              size="sm"
              startContent={
                hasNote ? <StickyNote size={16} /> : <PlusIcon size={16} />
              }
              variant={hasNote ? "flat" : "light"}
              onPress={() => {
                setSelectedApplication(app);
                onNotesModalOpen();
              }}
            />
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
        case "branch_uuid":
          const currentBranchUuid = (app as any).branch_uuid;
          return (
            <>
              {data?.is_profile_headquarter ? (
                <Select
                  size="sm"
                  className="w-40"
                  selectedKeys={currentBranchUuid ? [currentBranchUuid] : []}
                  onSelectionChange={(keys) => {
                    const newBranchUuid = Array.from(keys)[0] as string;
                    handleBranchChange(app, newBranchUuid);
                  }}
                >
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} textValue={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </Select>
              ) : (
                <div className="text-primary font-semibold">
                  {(app as any).branches.name}
                </div>
              )}
            </>
          );

        default:
          return app[columnKey as keyof Application];
      }
    },
    [branches, mutate, handleBranchChange]
  );

  /* ================= TOP CONTENT ================= */

  const topContent = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Application</h2>
        <div className="flex items-center gap-2">
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
          <Tooltip content="Đồng bộ dữ liệu từ API">
            <Button
              isIconOnly
              color="primary"
              variant="flat"
              isDisabled={isSyncing}
              onPress={handleSync}
            >
              <RotateCw className={isSyncing ? "animate-spin" : ""} size={20} />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by code, fullname, customer code, phone..."
          startContent={<SearchIcon />}
          value={filterValue}
          onClear={() => {
            setFilterValue("");
            setPage(1);
          }}
          onValueChange={(v) => {
            setFilterValue(v || "");
            setPage(1);
          }}
        />

        <div className="flex gap-2 items-center">
          <Select
            className="w-3xs"
            placeholder="Status"
            selectedKeys={[String(statusFilter)]}
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
                endContent={<ChevronDownIcon className="text-small" />}
                variant="flat"
              >
                Columns
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              selectedKeys={visibleColumns}
              selectionMode="multiple"
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
            isDisabled={isLoading || isValidating}
            variant="flat"
            onPress={() => mutate()}
          >
            <RefreshCcw
              className={isLoading || isValidating ? "animate-spin" : ""}
              size={16}
            />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center text-small text-default-400">
        <span>Total {totalRows} applications</span>

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
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody
          emptyContent={isLoading ? "Loading..." : "No applications"}
          items={applications}
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
          application={selectedApplication}
          isOpen={isApplicationModalOpen}
          loginId={profile?.id}
          onClose={onApplicationModalClose}
        />
      )}
      {isNotesModalOpen && (
        <NotesModal
          application={selectedApplication}
          isOpen={isNotesModalOpen}
          loginId={profile?.id || 0}
          onClose={onNotesModalClose}
          onSuccess={() => {
            mutate(); // Refresh data after update
          }}
        />
      )}
    </>
  );
}
